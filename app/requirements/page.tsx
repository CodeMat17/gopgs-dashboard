"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RequirementsPage() {
  const requirements = useQuery(api.requirements.getRequirements);
  const otherRoutes = useQuery(
    api.alternativeAdmissions.getAlternativeAdmissionRoute
  );

  const updateRequirements = useMutation(api.mutations.updateRequirements);
  const updateOtherRoutes = useMutation(
    api.alternativeAdmissions.updateOtherRoutes
  );
  const addOtherRoute = useMutation(
    api.alternativeAdmissions.addAlternativeAdmissionRoute
  );
  const removeOtherRoute = useMutation(
    api.alternativeAdmissions.removeAlternativeAdmissionRoute
  );

  const [otherRouteInputs, setOtherRouteInputs] = useState<
    Record<Id<"alternativeAdmissions">, { title: string; description: string }>
  >({});

  const [inputs, setInputs] = useState<
    Record<
      Id<"admissionRequirements">,
      { title: string; requirements: string[] }
    >
  >({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (requirements) {
      setInputs(
        requirements.reduce(
          (acc, req) => ({
            ...acc,
            [req._id]: {
              title: req.title,
              requirements: [...req.requirements],
            },
          }),
          {} as Record<
            Id<"admissionRequirements">,
            { title: string; requirements: string[] }
          >
        )
      );
    }
  }, [requirements]);

  useEffect(() => {
    if (otherRoutes) {
      setOtherRouteInputs(
        otherRoutes.reduce(
          (acc, alternativeAdmissions) => {
            acc[alternativeAdmissions._id] = {
              title: alternativeAdmissions.title,
              description: alternativeAdmissions.description,
            };
            return acc;
          },
          {} as Record<
            Id<"alternativeAdmissions">,
            { title: string; description: string }
          >
        )
      );
    }
  }, [otherRoutes]);

  const handleRemoveRequirement = async (
    id: Id<"admissionRequirements">,
    index: number
  ) => {
    const loadingKey = `${id}-${index}`;
    const originalRequirements = [...inputs[id].requirements];

    try {
      setLoading((prev) => ({ ...prev, [loadingKey]: true }));

      // Create updated requirements array
      const newRequirements = originalRequirements.filter(
        (_, i) => i !== index
      );

      // Optimistic UI update
      setInputs((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          requirements: newRequirements,
        },
      }));

      // Update database
      await updateRequirements({
        id,
        title: inputs[id].title,
        requirements: newRequirements.filter((r) => r.trim() !== ""),
      });

      toast.success("Requirement removed successfully!");
    } catch (error) {
      toast.error("Error Msg: " + error);
      console.log("Error Msg: " + error);
      // Revert UI state on error
      setInputs((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          requirements: originalRequirements,
        },
      }));
      toast.error("Failed to remove requirement.");
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleRequirementChange = (
    id: Id<"admissionRequirements">,
    index: number,
    value: string
  ) => {
    const newRequirements = [...inputs[id].requirements];
    newRequirements[index] = value;
    setInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        requirements: newRequirements,
      },
    }));
  };

  const addRequirement = (id: Id<"admissionRequirements">) => {
    setInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        requirements: [...prev[id].requirements, ""],
      },
    }));
  };

  const handleUpdate = async (id: Id<"admissionRequirements">) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateRequirements({
        id,
        title: inputs[id].title,
        requirements: inputs[id].requirements.filter((r) => r.trim() !== ""),
      });
      toast.success("Requirements updated successfully!");
    } catch (error) {
      console.error("Failed to update requirements:", error);
      toast.error("Failed to update requirements.");
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleOtherRouteChange = (
    id: Id<"alternativeAdmissions">,
    field: "title" | "description",
    value: string
  ) => {
    setOtherRouteInputs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleUpdateOtherRoutes = async (
    otherId: Id<"alternativeAdmissions">
  ) => {
    const { title, description } = otherRouteInputs[otherId] || {};
    if (!title || !description) return;

    setLoading((prev) => ({ ...prev, [otherId]: true }));

    try {
      await updateOtherRoutes({ _id: otherId, title, description });
      toast.success("Other routes updated successfully!");
    } catch (error) {
      console.error("Failed to update other routes:", error);
      toast.error("Failed to update vision.");
    } finally {
      setLoading((prev) => ({ ...prev, [otherId]: false }));
    }
  };

  const handleAddNewOtherRoute = async () => {
    try {
      const newRouteId = await addOtherRoute({
        title: "New Alternative Route",
        description: "Description goes here...",
      });

      setOtherRouteInputs((prev) => ({
        ...prev,
        [newRouteId]: { title: "New Alternative Route", description: "" },
      }));

      toast.success("New alternative route added!");
    } catch (error) {
      console.error("Failed to add new other route:", error);
      toast.error("Failed to add new other route.");
    }
  };

  const handleRemoveOtherRoute = async (id: Id<"alternativeAdmissions">) => {
    try {
      await removeOtherRoute({ _id: id });
      setOtherRouteInputs((prev) => {
        const updatedInputs = { ...prev };
        delete updatedInputs[id];
        return updatedInputs;
      });
      toast.success("Alternative route removed successfully!");
    } catch (error) {
      console.error("Failed to remove alternative route:", error);
      toast.error("Failed to remove alternative route.");
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto px-4 py-8 sm:py-12'>
      <h1 className='text-2xl sm:text-3xl font-bold mb-6'>
        Admission Requirements
      </h1>

      <div className=' mb-8'>
        <h2 className='text-xl font-bold mb-4'>Manage Requirements</h2>

        {!requirements ? (
          <p className='text-gray-500'>Loading requirements...</p>
        ) : requirements.length > 0 ? (
          requirements.map((req) => (
            <div key={req._id} className='mb-8 space-y-4 border-b pb-8'>
              <Card className='p-3 sm:p-6 rounded-xl'>
                <div className='flex justify-between items-start mb-2'>
                  <Input
                    placeholder='Section Title'
                    value={inputs[req._id]?.title || ""}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        [req._id]: {
                          ...prev[req._id],
                          title: e.target.value,
                        },
                      }))
                    }
                    className='text-lg font-semibold flex-1'
                  />
                </div>

                <div className='space-y-2 '>
                  {inputs[req._id]?.requirements.map((requirement, index) => (
                    <div key={index} className='flex gap-2 items-center'>
                      <Input
                        value={requirement}
                        onChange={(e) =>
                          handleRequirementChange(
                            req._id,
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Requirement ${index + 1}`}
                      />
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveRequirement(req._id, index)}
                        disabled={loading[`${req._id}-${index}`]}
                        className='text-red-500 hover:text-red-700'>
                        {loading[`${req._id}-${index}`] ? (
                          <span className='animate-spin'>🌀</span>
                        ) : (
                          "Remove"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className='flex gap-2 mt-4'>
                  <Button
                    variant='outline'
                    onClick={() => addRequirement(req._id)}>
                    Add Requirement
                  </Button>
                  <Button
                    onClick={() => handleUpdate(req._id)}
                    disabled={loading[req._id]}>
                    {loading[req._id] ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>
            </div>
          ))
        ) : (
          <p className='text-gray-500'>No requirements found.</p>
        )}
      </div>
      <div className=' mb-8'>
        <h2 className='text-xl font-bold mb-4'>Other Routes</h2>

        {/* Update Other Routes Section */}
        <div>
          <h2 className='text-xl font-bold mb-4'>Update Other Routes</h2>
          {!otherRoutes ? (
            <p className='text-gray-500'>Loading visions...</p>
          ) : otherRoutes.length > 0 ? (
            otherRoutes.map((others) => (
              <Card key={others._id} className='mb-4 p-4 sm:p-6 space-y-4'>
                <Input
                  placeholder='Other Route Title'
                  value={otherRouteInputs[others._id]?.title || ""}
                  onChange={(e) =>
                    handleOtherRouteChange(others._id, "title", e.target.value)
                  }
                  className='mb-2 text-lg font-semibold'
                />
                <Textarea
                  placeholder='Vision Description'
                  value={otherRouteInputs[others._id]?.description || ""}
                  onChange={(e) =>
                    handleOtherRouteChange(
                      others._id,
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  className='mb-2'
                />
                <div className='flex gap-2'>
                  <Button
                    onClick={() => handleUpdateOtherRoutes(others._id)}
                    disabled={loading[others._id]}>
                    {loading[others._id] ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={() => handleRemoveOtherRoute(others._id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className='text-gray-500'>No admission other route found.</p>
          )}
          <Button onClick={handleAddNewOtherRoute} className='mt-4'>
            Add New Entry
          </Button>
        </div>
      </div>
    </div>
  );
}
