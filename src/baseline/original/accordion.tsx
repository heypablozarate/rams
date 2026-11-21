import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../primitives/accordion";

export function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="stock"
      style={{ width: "100%", maxWidth: "var(--rams-detail-preview-measure-wide)" }}
    >
      <AccordionItem value="stock">
        <AccordionTrigger>Paper and grain</AccordionTrigger>
        <AccordionContent>
          Cotton stock, 180 gsm. The grain runs parallel to the fold.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="trim">
        <AccordionTrigger>Finished format</AccordionTrigger>
        <AccordionContent>
          148 × 210 mm, with the long edge folded.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="inks">
        <AccordionTrigger>Press passes</AccordionTrigger>
        <AccordionContent>
          Two passes: the grid first, then the terrace silhouette.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
