"use client";
import {useId,useRef,useState}from'react';
import{Button}from'../components/button';
import{Input}from'../components/input';
import{Textarea}from'../components/textarea';
import{Label}from'../components/label';
import{Separator}from'../components/separator';
import'./print-proof.css';

const initial={title:'Delta / 08',notes:'Two inks on uncoated stock. Hand-numbered in Rosario.'};
/** An original, local print-proof workflow. It does not call a service. */
export function PrintProof(){
 const id=useId(),titleRef=useRef<HTMLInputElement>(null);
 const[title,setTitle]=useState(initial.title),[notes,setNotes]=useState(initial.notes),[saved,setSaved]=useState<typeof initial|null>(null),[notice,setNotice]=useState(''),[invalid,setInvalid]=useState(false);
 return <main className="print-proof">
  <header><p className="print-proof-kicker">Sur Print Archive · Rosario</p><h1 className="rams-editorial-title">An edition in the making.</h1><p>Review the title and production notes before saving the proof.</p></header>
  <div className="print-proof-layout">
   <figure className="print-proof-poster"><div aria-hidden="true"><span>Sur / 08</span><div className="print-proof-lines"/><strong>{title||'Untitled edition'}</strong><span>Rosario · Screenprint series</span></div><figcaption>Edition proof</figcaption></figure>
   <form onSubmit={event=>{event.preventDefault();setInvalid(false);setSaved({title:title.trim(),notes:notes.trim()});setNotice('Proof saved: '+title.trim());}} onReset={()=>{setTitle(initial.title);setNotes(initial.notes);setNotice('');setInvalid(false);}}>
    <div><Label htmlFor={id+'-title'}>Edition title</Label><Input ref={titleRef} id={id+'-title'} name="title" value={title} onChange={event=>setTitle(event.target.value)} required pattern={".*\\S.*"} onInvalid={()=>setInvalid(true)} aria-invalid={invalid||undefined} aria-describedby={invalid?id+'-error':undefined}/>{invalid&&<p id={id+'-error'} role="alert">Enter an edition title.</p>}</div>
    <div><Label htmlFor={id+'-notes'}>Production notes</Label><Textarea id={id+'-notes'} name="notes" value={notes} onChange={event=>setNotes(event.target.value)}/></div>
    <Separator decorative={false} aria-label="Proof actions"/>
    <div className="print-proof-actions"><Button type="submit">Save this proof to the print archive</Button><Button type="reset" variant="outline">Reset draft</Button></div>
    <output aria-live="polite">{notice}</output>
    {saved&&<section className="print-proof-record" aria-label="Saved proof"><h2>Saved proof</h2><p><strong>{saved.title}</strong></p>{saved.notes&&<p>{saved.notes}</p>}</section>}
   </form>
  </div>
 </main>;
}
