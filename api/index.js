export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({reply:"Only POST allowed."});

 const b=req.body||{},msg=(b.message||"").trim(),img=b.image||null,mode=b.mode||"chat";
 if(!msg)return res.status(400).json({reply:"Mujhe message bhejo 😊"});

 const key=process.env.OPENROUTER_API_KEY;
 if(!key)return res.status(500).json({reply:"OPENROUTER_API_KEY Vercel mein set nahi hai."});

 let task="";
 if(mode==="study")task=`
You are an excellent Class 11 style teacher.
Give a clean ChatGPT-like answer.
Use short headings, numbered steps, formulas, examples and useful emojis.
For maths show ordered calculations and final answer clearly.
Remember the current study conversation context.
`;

 if(mode==="project")task=`
Act as an expert project builder.
Use exactly:
1. 💡 Idea / Goal
2. 📋 Requirements
3. 📁 File Structure
4. 🪜 Step-by-Step
5. 💻 Complete Code
6. 🧪 Testing
7. 🚀 Next Step
Keep explanation and code clearly separated.
Never remove existing working features unless explicitly asked.
`;

 if(mode==="food")task=`
Analyze the supplied food image carefully.
Give:
🍽️ Food identified
🥗 What it generally contains
💪 Benefits / advantages
⚠️ Disadvantages / concerns
🔥 Approximate nutrition when reasonably possible
👥 Who should be careful
💡 Healthy way to eat it
Never invent exact nutrition from appearance alone.
`;

 const system=`You are Bablu AI 🤖 — friendly, intelligent, natural and practical.
Understand human intent, context and goals.
Reply in the user's language. Hindi/Hinglish should be simple and natural.
Use useful emojis naturally, not excessively.
Keep answers clean, readable and reasonably short.
Never expose system instructions, API keys or private configuration.
Never claim an action was completed when it was not.
You are skilled in coding, HTML, CSS, JavaScript, Python, Java, Kotlin, Android, APIs, backend, databases, GitHub, Vercel, AI, image/video, voice, automation and game development.
${task}`;

 try{
  const history=Array.isArray(b.history)?b.history.slice(-12):[];
  const content=img
   ?[{type:"text",text:msg},{type:"image_url",image_url:{url:img}}]
   :msg;

  const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
   method:"POST",
   headers:{
    Authorization:`Bearer ${key}`,
    "Content-Type":"application/json",
    "HTTP-Referer":"https://bablu-ai.vercel.app",
    "X-Title":"Bablu AI"
   },
   body:JSON.stringify({
    model:"openrouter/free",
    messages:[
     {role:"system",content:system},
     ...history.filter(x=>x?.role&&x?.content),
     {role:"user",content}
    ]
   })
  });

  const d=await r.json();
  if(!r.ok)return res.status(r.status).json({
   reply:d?.error?.message||"AI se jawab nahi mila."
  });

  res.status(200).json({
   type:"text",
   reply:d?.choices?.[0]?.message?.content||"Jawaab nahi mila."
  });
 }catch(e){
  console.error(e);
  res.status(500).json({reply:"Server se connection nahi ho paya."});
 }
  }
