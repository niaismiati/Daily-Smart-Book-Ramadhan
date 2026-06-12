import{d as n,b as e}from"./index-BR9KAbtV.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],l=n("calendar",r);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M16 16s-1.5-2-4-2-4 2-4 2",key:"epbg0q"}],["line",{x1:"9",x2:"9.01",y1:"9",y2:"9",key:"yxxnd0"}],["line",{x1:"15",x2:"15.01",y1:"9",y2:"9",key:"1p4y9e"}]],d=n("frown",s);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]],k=n("heart",o);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"8",x2:"16",y1:"15",y2:"15",key:"1xb1d9"}],["line",{x1:"9",x2:"9.01",y1:"9",y2:"9",key:"yxxnd0"}],["line",{x1:"15",x2:"15.01",y1:"9",y2:"9",key:"1p4y9e"}]],h=n("meh",c);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 14s1.5 2 4 2 4-2 4-2",key:"1y1vjs"}],["line",{x1:"9",x2:"9.01",y1:"9",y2:"9",key:"yxxnd0"}],["line",{x1:"15",x2:"15.01",y1:"9",y2:"9",key:"1p4y9e"}]],m=n("smile",i),g=async()=>{try{return(await e.get("/journals")).data}catch{return{journals:[{id:1,content:"Hari ini saya belajar tentang puasa Ramadan. Sangat bersyukur bisa menjalankan ibadah di bulan yang penuh berkah ini.",mood:"grateful",reflection:"Perbanyak membaca Al-Quran",created_at:new Date().toISOString(),streak:!0},{id:2,content:"Saya menghadiri kajian subuh tentang keutamaan 10 hari pertama Ramadan. Sangat menginspirasi!",mood:"excited",reflection:"Catat poin-poin penting kajian",created_at:new Date(Date.now()-864e5).toISOString(),streak:!0},{id:3,content:"Hari ini agak berat karena banyak tugas sekolah. Tapi tetap berusaha menjaga sholat 5 waktu.",mood:"neutral",reflection:"Atur waktu lebih baik",created_at:new Date(Date.now()-2*864e5).toISOString(),streak:!0}]}}},p=async a=>{try{return(await e.post("/journals",a)).data}catch{return{journal:{id:Date.now(),...a,created_at:new Date().toISOString()}}}},x=async(a,t)=>{try{return(await e.put(`/journals/${a}`,t)).data}catch{return{journal:{id:a,...t}}}},j=async a=>{try{return(await e.delete(`/journals/${a}`)).data}catch{return{success:!0}}},w=async()=>{try{return(await e.get("/teacher/journals")).data}catch{return{students:[{id:1,name:"Ahmad Fauzi",nisn:"1234567890",class:"7A",journals_count:5},{id:2,name:"Siti Aminah",nisn:"1234567891",class:"7A",journals_count:3},{id:3,name:"Budi Santoso",nisn:"1234567892",class:"7B",journals_count:0},{id:4,name:"Dewi Lestari",nisn:"1234567893",class:"7B",journals_count:7},{id:5,name:"Rudi Hermawan",nisn:"1234567894",class:"8A",journals_count:2}]}}},b=async a=>{try{return(await e.get(`/teacher/journals/${a}`)).data}catch{return{journals:[{id:1,content:"Hari ini belajar tentang fikih puasa.",mood:"happy",reflection:"Perlu banyak belajar",created_at:new Date().toISOString()},{id:2,content:"Mengikuti tadarus Al-Quran di masjid.",mood:"grateful",created_at:new Date(Date.now()-864e5).toISOString()}]}}};export{l as C,d as F,k as H,h as M,m as S,w as a,b,p as c,j as d,g,x as u};
