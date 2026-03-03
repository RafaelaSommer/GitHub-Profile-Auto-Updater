const { spawn } = require("child_process");
const { DateTime } = require("luxon");
const fs = require("fs");
const path = require("path");

const SETTINGS = JSON.parse(
  fs.readFileSync(path.join(__dirname,"../.github/settings.json"))
);

function dentroHorario(){
  const now = DateTime.now().setZone(SETTINGS.timezone);
  return now.hour >= SETTINGS.business_hours.start &&
         now.hour < SETTINGS.business_hours.end;
}

async function loop(){
  console.log("🤖 Bot iniciado.");

  while(true){
    if(dentroHorario()){
      console.log("🚀 Executando atualização...");
      await new Promise(resolve=>{
        const child = spawn("node",["scripts/update_readme.js"],{stdio:"inherit"});
        child.on("exit",resolve);
      });
    }else{
      console.log("⏹ Fora do horário (7h-23h).");
    }

    await new Promise(r=>setTimeout(r, SETTINGS.interval_minutes*60000));
  }
}

loop();