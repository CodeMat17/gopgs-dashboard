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

export default function AdminDashboard() {
  const missions = useQuery(api.mission.getMission);
  const visions = useQuery(api.vision.getVision);

  const updateMission = useMutation(api.mission.updateMission);
  const updateVision = useMutation(api.vision.updateVision);

  const [missionInputs, setMissionInputs] = useState<
    Record<Id<"mission">, { title: string; desc: string }>
  >({});
  const [visionInputs, setVisionInputs] = useState<
    Record<Id<"vision">, { title: string; desc: string }>
  >({});

  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (missions) {
      setMissionInputs(
        missions.reduce(
          (acc, mission) => {
            acc[mission._id] = { title: mission.title, desc: mission.desc };
            return acc;
          },
          {} as Record<Id<"mission">, { title: string; desc: string }>
        )
      );
    }
  }, [missions]);

  useEffect(() => {
    if (visions) {
      setVisionInputs(
        visions.reduce(
          (acc, vision) => {
            acc[vision._id] = { title: vision.title, desc: vision.desc };
            return acc;
          },
          {} as Record<Id<"vision">, { title: string; desc: string }>
        )
      );
    }
  }, [visions]);

  const handleMissionChange = (
    id: Id<"mission">,
    field: "title" | "desc",
    value: string
  ) => {
    setMissionInputs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleVisionChange = (
    id: Id<"vision">,
    field: "title" | "desc",
    value: string
  ) => {
    setVisionInputs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleUpdateMission = async (missionId: Id<"mission">) => {
    const { title, desc } = missionInputs[missionId] || {};
    if (!title || !desc) return;

    setLoading((prev) => ({ ...prev, [missionId]: true }));

    try {
      await updateMission({ _id: missionId, title, desc });
      toast.success("Mission updated successfully!");
    } catch (error) {
      console.error("Failed to update mission:", error);
      toast.error("Failed to update mission.");
    } finally {
      setLoading((prev) => ({ ...prev, [missionId]: false }));
    }
  };

  const handleUpdateVision = async (visionId: Id<"vision">) => {
    const { title, desc } = visionInputs[visionId] || {};
    if (!title || !desc) return;

    setLoading((prev) => ({ ...prev, [visionId]: true }));

    try {
      await updateVision({ _id: visionId, title, desc });
      toast.success("Vision updated successfully!");
    } catch (error) {
      console.error("Failed to update vision:", error);
      toast.error("Failed to update vision.");
    } finally {
      setLoading((prev) => ({ ...prev, [visionId]: false }));
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto px-4 py-8 sm:py-12'>
      <h1 className='text-2xl sm:text-3xl font-bold mb-6'>About Us</h1>

      {/* Update Mission Section */}
      <Card className='p-6 mb-8'>
        <h2 className='text-xl font-bold mb-4'>Update Mission</h2>
        {!missions ? (
          <p className='text-gray-500'>Loading missions...</p>
        ) : missions.length > 0 ? (
          missions.map((mission) => (
            <div key={mission._id} className='mb-4 space-y-4'>
              <Input
                placeholder='Mission Title'
                value={missionInputs[mission._id]?.title || ""}
                onChange={(e) =>
                  handleMissionChange(mission._id, "title", e.target.value)
                }
                className='mb-2 text-lg font-semibold'
              />
              <Textarea
                placeholder='Mission Description'
                value={missionInputs[mission._id]?.desc || ""}
                onChange={(e) =>
                  handleMissionChange(mission._id, "desc", e.target.value)
                }
                rows={4}
                className='mb-2'
              />
              <Button
                onClick={() => handleUpdateMission(mission._id)}
                disabled={loading[mission._id]}>
                {loading[mission._id] ? "Updating..." : "Update Mission"}
              </Button>
            </div>
          ))
        ) : (
          <p className='text-gray-500'>No missions found.</p>
        )}
      </Card>

      {/* Update Vision Section */}
      <Card className='p-6'>
        <h2 className='text-xl font-bold mb-4'>Update Vision</h2>
        {!visions ? (
          <p className='text-gray-500'>Loading visions...</p>
        ) : visions.length > 0 ? (
          visions.map((vision) => (
            <div key={vision._id} className='mb-4 space-y-4'>
              <Input
                placeholder='Vision Title'
                value={visionInputs[vision._id]?.title || ""}
                onChange={(e) =>
                  handleVisionChange(vision._id, "title", e.target.value)
                }
                className='mb-2 text-lg font-semibold'
              />
              <Textarea
                placeholder='Vision Description'
                value={visionInputs[vision._id]?.desc || ""}
                onChange={(e) =>
                  handleVisionChange(vision._id, "desc", e.target.value)
                }
                rows={4}
                className='mb-2'
              />
              <Button
                onClick={() => handleUpdateVision(vision._id)}
                disabled={loading[vision._id]}>
                {loading[vision._id] ? "Updating..." : "Update Vision"}
              </Button>
            </div>
          ))
        ) : (
          <p className='text-gray-500'>No visions found.</p>
        )}
      </Card>
    </div>
  );
}
