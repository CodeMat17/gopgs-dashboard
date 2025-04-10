"use client";

import { useState } from "react";
import IntlTelInput, { CountryData } from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { toast } from "sonner";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneNumberInput = ({
  value,
  onChange,
}: PhoneNumberInputProps) => {
  const [error, setError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState<string>(value);

  const handleChange = (_isValid: boolean, number: string) => {
    setRawInput(number); // Just update input as user types
  };

  const handleBlur = (
    _isValid: boolean,
    _1: string,
    countryData: CountryData,
    fullNumber: string
  ) => {
    if (!countryData.iso2) {
      setError("Cannot determine country");
      toast.error("Could not detect country.");
      return;
    }

    const parsed = parsePhoneNumberFromString(
      fullNumber,
      countryData.iso2.toUpperCase() as CountryCode
    );

    if (!parsed || !parsed.isValid()) {
      setError("Invalid phone number");
      toast.error("Invalid Phone Number", {
        description: "Please enter a valid phone number.",
      });
      return;
    }

    const e164 = parsed.number;
    setError(null);
    onChange(e164); // Pass E.164 string to parent
  };

  return (
    <div className='space-y-0.5 flex flex-col'>
      <label htmlFor='phone' className='text-sm text-gray-500'>
        Phone Number
      </label>

      <IntlTelInput
        fieldName='tel'
        preferredCountries={["ng"]}
        defaultCountry='ng'
        format
        value={rawInput}
        onPhoneNumberChange={handleChange}
        onPhoneNumberBlur={handleBlur}
        inputClassName='w-full p-2 rounded-md border bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50'
      />

      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
};
