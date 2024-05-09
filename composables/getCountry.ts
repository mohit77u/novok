import { COUNTRIES } from "~/helper/data";

const getSelectedCountry = ref({});
const getCountry = ref({});

export const useGetSelectedCountry = () => {
  const getSelectedCountryCode = () => {
    const selectedCountry = COUNTRIES.find((country) => {
      return country.mobileCode === "+44";
    });
    return {
      label: selectedCountry?.mobileCode,
      value: selectedCountry?.mobileCode,
    };
  };

  const getCountryCode = () => {
    const countryName = COUNTRIES.map((country) => {
      return {
        label: country.mobileCode,
        value: country.mobileCode,
      };
    });
    return countryName;
  };

  onMounted(() => {
    getSelectedCountry.value = getSelectedCountryCode();
    getCountry.value = getCountryCode();
  });

  return {
    getSelectedCountry,
    getCountry,
  };
};
