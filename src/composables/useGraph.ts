import { isObject } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";
import { type SimulationLinkDatum, type SimulationNodeDatum } from "d3-force";
import { useTruncate } from "@/composables/useTruncate";
import { type NodeDatum } from "@/components/federated-voting/GraphManager";

const truncate = useTruncate();

export default function useGraph() {
  const getLinkPath = (link: SimulationLinkDatum<SimulationNodeDatum>) => {
    if (!isObject(link.source))
      throw new Error("Source not transformed into object by D3");
    if (!isObject(link.target))
      throw new Error("Target not transformed into object by D3");
    return (
      "M" +
      link.source.x +
      " " +
      link.source.y +
      " L" +
      link.target.x +
      " " +
      link.target.y
    );
  };

  const getNodeTransform = (node: NodeDatum): string => {
    return `translate(${node.x},${node.y})`;
  };

  const getLabelWidth = (label: string, truncateLength: number) =>
    (truncate(label, truncateLength).length / truncateLength) * 60;

  const getLabelX = (label: string, truncateLength: number) => {
    return "-" + getLabelWidth(label, truncateLength) / 2;
  };

  return {
    getLinkPath,
    getLabelWidth,
    getLabelX,
    getNodeTransform,
  };
}
