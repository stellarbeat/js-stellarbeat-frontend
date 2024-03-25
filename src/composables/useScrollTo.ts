import { nextTick } from "vue";

export default function useScrollTo() {
  return (elementId: string) => {
    nextTick(() => {
      const contentElement = document.getElementById(elementId);
      if (contentElement) {
        let cumulativeTop = 0;
        let currentElement = contentElement;

        // Calculate the cumulative offset of the element from the top of the page
        while (currentElement) {
          cumulativeTop += currentElement.offsetTop;
          currentElement = currentElement.offsetParent as HTMLElement;
        }

        window.scrollTo({
          top: cumulativeTop,
          behavior: "smooth",
        });
      }
    });
  };
}
