import { computed, ref } from "vue";

export function useIsLoading() {
  const isLoading = ref(true);

  return {
    isLoading,
    dimmerClass: computed(() => {
      return {
        dimmer: true,
        active: isLoading.value,
      };
    }),
  };
}
