export default async function handler(req,res){
if(req.method!="POST")return res.status(405).json({reply:"Only POST allowed."});
let b=req.body||{},q=(b.message||"").trim(),key=process.env.OPENROUTER_API_KEY;
if(!q)return res.status(400).json({reply:"Message bhejo 😊"});
if(!key)return res.status(500).json({reply:"API key set nahi hai."});

let mode=b.mode||"chat",task="";
if(mode=="study")task=`You are a Class 11 teacher. Explain clearly with simple language, headings, steps, formulas and examples.`;
if(mode=="project")task=`You are an expert project builder. Give clean, practical answers in this order:
1. 💡 Idea / Goal
2. 📋 Requirements
3. 📁 File Structure
4. 🪜 Step-by-Step
5. 💻 Complete Code
6. 🧪 Testing
7. 🚀 Next Step
Keep explanation and code separate. Never remove working features. If user asks "this in Hindi", translate/explain the previous answer from context, not ask what they mean.`;
if(mode=="food")task=`Analyze the food image. Give: 🍽️ Food, 🥗 Contents, 💪 Benefits, ⚠️ Concerns, 🔥 Estimated nutrition, 👥 Who should be careful, 💡 Healthy way. Never invent exact nutrition.`;

let system=`You are Bablu AI 🤖.
Understand the user's intent and conversation context.
Reply in the same language the user is using.
For Hindi/Hinglish use VERY SIMPLE, NATURAL and CORRECT Hindi. Avoid difficult Sanskrit words and awkward translations. Check spelling and grammar.
For English use clean, easy English.
Use useful creative emojis naturally.
Keep answers clear, friendly and point-wise.
Never claim an action was completed if it was not.
${task}`;

try{
let h=Array.isArray(b.history)?b.history.slice(-14):[];
let content=b.image?[{type:"text",text:q},{type:"image_url",image_url:{url:b.image}}]:q;
let r=await fetch("https://openrouter.ai/api/v1/chat/completions",{
method:"POST",
headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json","HTTP-Referer":"https://bablu-ai.vercel.app","X-Title":"Bablu AI"},
body:JSON.stringify({model:"openrouter/free",messages:[{role:"system",content:system},...h,{role:"user",content}]})
});
let d=await r.json();
if(!r.ok)return res.status(r.status).json({reply:d?.error?.message||"AI se jawab nahi mila."});
res.status(200).json({type:"text",reply:d?.choices?.[0]?.message?.content||"Jawaab nahi mila."});
}catch(e){res.status(500).json({reply:"Server se connection nahi ho paya."})}
 }
