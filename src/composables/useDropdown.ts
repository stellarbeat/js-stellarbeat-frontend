import { onMounted, ref } from "vue";

export function useDropdown(
  expand: boolean,
  emit: (event: "toggleExpand", ...args: unknown[]) => void,
) {
  const currentPage = ref(1);
  const perPage = ref(10);
  const showing = ref(false);

  function paginate<T>(items: T[]): T[] {
    return items.slice(
      (currentPage.value - 1) * perPage.value,
      currentPage.value * perPage.value,
    );
  }

  function toggleShow(): void {
    showing.value = !showing.value;
    emit("toggleExpand");
  }

  onMounted(() => {
    showing.value = expand;
  });

  return {
    currentPage,
    perPage,
    showing,
    paginate,
    toggleShow,
  };
}
