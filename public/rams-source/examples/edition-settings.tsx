"use client";
import{useId,useState}from'react';
import{Button}from'../components/button';
import{Label}from'../components/label';
import{Checkbox}from'../components/checkbox';
import{Switch}from'../components/switch';
import{Toggle}from'../components/toggle';
import{ToggleGroup,ToggleGroupItem}from'../components/toggle-group';
import{Accordion,AccordionItem,AccordionTrigger,AccordionContent}from'../components/accordion';
import{Collapsible,CollapsibleTrigger,CollapsibleContent}from'../components/collapsible';
import{Tabs,TabsList,TabsTrigger,TabsContent}from'../components/tabs';
import'./edition-settings.css';
export function EditionSettings(){
 const id=useId();const[marks,setMarks]=useState(true),[notes,setNotes]=useState(false),[mirror,setMirror]=useState(false),[faces,setFaces]=useState(['front']);
 return <main className="edition-settings">
  <header><p>Sur Print Archive · Santa Fe</p><h1 className="rams-editorial-title">Prepare the next edition.</h1></header>
  <Tabs defaultValue="plates"><TabsList aria-label="Edition settings"><TabsTrigger value="plates">Printing plates</TabsTrigger><TabsTrigger value="materials">Materials</TabsTrigger><TabsTrigger value="delivery" disabled>Delivery</TabsTrigger></TabsList>
   <TabsContent value="plates"><section className="edition-settings-controls" aria-label="Plate settings">
    <div className="edition-settings-control"><Checkbox id={id+'-marks'} checked={marks} onCheckedChange={value=>setMarks(value===true)}/><Label htmlFor={id+'-marks'}>Include registration marks</Label></div>
    <div className="edition-settings-control"><Switch id={id+'-notes'} checked={notes} onCheckedChange={setNotes}/><Label htmlFor={id+'-notes'}>Show production notes</Label></div>
    {notes&&<p>The first color dries before the second plate is registered.</p>}
    <Toggle variant="outline" pressed={mirror} onPressedChange={setMirror} aria-label="Mirror plate">Mirror plate</Toggle>
    <div className="edition-settings-plate" data-mirrored={mirror||undefined} aria-label={mirror?'Mirrored plate preview':'Plate preview'}><span aria-hidden="true">SUR / 09</span>{marks&&<i aria-hidden="true"/>}</div>
    <ToggleGroup type="multiple" value={faces} onValueChange={setFaces} variant="outline" aria-label="Printed faces"><ToggleGroupItem value="front">Front</ToggleGroupItem><ToggleGroupItem value="back">Back</ToggleGroupItem></ToggleGroup>
    <output aria-live="polite">{faces.length?'Printed faces: '+faces.join(', '):'No printed faces selected'}</output>
   </section></TabsContent>
   <TabsContent value="materials"><Accordion type="single" collapsible><AccordionItem value="stock"><AccordionTrigger>Paper stock</AccordionTrigger><AccordionContent>Cotton sheet, 240 g/m², cut to 35 × 50 cm.</AccordionContent></AccordionItem><AccordionItem value="ink"><AccordionTrigger>Ink order</AccordionTrigger><AccordionContent>Warm gray first; black overprint second.</AccordionContent></AccordionItem></Accordion></TabsContent>
  </Tabs>
  <Collapsible><CollapsibleTrigger asChild><Button type="button" variant="outline">Packing instructions</Button></CollapsibleTrigger><CollapsibleContent>Separate each proof with glassine before placing it in the archive folder.</CollapsibleContent></Collapsible>
 </main>;
}
