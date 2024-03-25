import { onMounted } from "vue";
import useStore from "@/store/useStore";

export default function useMetaTags(title: string, description: string) {
  const store = useStore();
  onMounted(() => {
    document.title = title + " | " + store.appConfig.brandName;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta") as HTMLMetaElement;
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);
  });
}
