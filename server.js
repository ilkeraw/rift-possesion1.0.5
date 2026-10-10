const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with proper CORS for host environments like Render
const io = new Server(server, { 
  cors: { 
    origin: '*', 
    methods: ['GET', 'POST'] 
  } 
});

app.use(express.static(path.join(__dirname, 'public')));

// 1. COMPREHENSIVE CHAMPION DATASET
const CHAMPIONS = {
  // Dual-range stance/hybrid champions
  "Jayce":          { regions: ["Piltover"], species: "Human", gender: "Male", roles: ["Fighter", "Marksman"], resource: "Mana", ranges: ["Melee", "Ranged"], year: 2012, traits: ["Knockup"] },
  "Nidalee":        { regions: ["Ixtal"], species: "Human", gender: "Female", roles: ["Assassin", "Mage"], resource: "Mana", ranges: ["Melee", "Ranged"], year: 2009, traits: ["Dash"] },
  "Elise":          { regions: ["Noxus", "Shadow Isles"], species: "Monster/Beast", gender: "Female", roles: ["Mage", "Assassin"], resource: "Mana", ranges: ["Melee", "Ranged"], year: 2012, traits: ["Stun", "Untargetable"] },
  "Gnar":           { regions: ["Freljord", "Bandle City"], species: "Yordle", gender: "Male", roles: ["Fighter", "Tank"], resource: "Manaless", ranges: ["Melee", "Ranged"], year: 2014, traits: ["Knockup", "Stun"] },
  "Kayle":          { regions: ["Demacia", "Targon"], species: "Aspect/Celestial", gender: "Female", roles: ["Fighter", "Mage"], resource: "Mana", ranges: ["Melee", "Ranged"], year: 2009, traits: ["True Damage", "Invulnerable"] },
  "Samira":         { regions: ["Shurima", "Noxus"], species: "Human", gender: "Female", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Melee", "Ranged"], year: 2020, traits: ["Knockup", "Dash"] },

  // Standard Roster & Custom Additions
  "Aatrox":         { regions: ["Shurima", "Runeterra"], species: "Darkin", gender: "Male", roles: ["Fighter"], resource: "Manaless", ranges: ["Melee"], year: 2013, traits: ["Knockup", "Dash"] },
  "Ahri":           { regions: ["Ionia"], species: "Vastaya", gender: "Female", roles: ["Mage", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Charm", "Dash", "True Damage"] },
  "Akali":          { regions: ["Ionia"], species: "Human", gender: "Female", roles: ["Assassin"], resource: "Energy", ranges: ["Melee"], year: 2010, traits: ["Stealth", "Dash"] },
  "Akshan":         { regions: ["Shurima"], species: "Human", gender: "Male", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2021, traits: ["Stealth", "Shield", "Hook"] },
  "Alistar":        { regions: ["Runeterra", "Noxus"], species: "Monster/Beast", gender: "Male", roles: ["Tank", "Support"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Knockup", "Stun"] },
  "Ambessa":        { regions: ["Noxus"], species: "Human", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Energy", ranges: ["Melee"], year: 2024, traits: ["Dash", "Stun", "Knockup"] },
  "Amumu":          { regions: ["Shurima"], species: "Undead/Spirit", gender: "Male", roles: ["Tank", "Support"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Stun", "Hook"] },
  "Anivia":         { regions: ["Freljord"], species: "Aspect/Celestial", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun", "Wall"] },
  "Annie":          { regions: ["Noxus", "Runeterra"], species: "Human", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun", "Shield"] },
  "Aphelios":       { regions: ["Targon"], species: "Human", gender: "Male", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2019, traits: ["Root", "Global Ult"] },
  "Ashe":           { regions: ["Freljord"], species: "Human", gender: "Female", roles: ["Marksman", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun", "Global Ult"] },
  "Aurelion Sol":   { regions: ["Targon", "Runeterra"], species: "Aspect/Celestial", gender: "Male", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2016, traits: ["Knockup", "Stun"] },
  "Aurora":         { regions: ["Freljord"], species: "Vastaya", gender: "Female", roles: ["Mage", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2024, traits: ["Stealth", "Dash", "Untargetable"] },
  "Azir":           { regions: ["Shurima"], species: "Aspect/Celestial", gender: "Male", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2014, traits: ["Knockup", "Dash", "Wall"] },
  "Bard":           { regions: ["Targon", "Runeterra"], species: "Aspect/Celestial", gender: "Indeterminate", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2015, traits: ["Stun", "Stasis"] },
  "Bel'Veth":       { regions: ["Void"], species: "Monster/Beast", gender: "Female", roles: ["Fighter"], resource: "Manaless", ranges: ["Melee"], year: 2022, traits: ["Knockup", "Dash", "True Damage"] },
  "Blitzcrank":     { regions: ["Zaun"], species: "Golem/Construct", gender: "Indeterminate", roles: ["Tank", "Support"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Hook", "Knockup", "Silence", "Shield"] },
  "Brand":          { regions: ["Freljord", "Runeterra"], species: "Undead/Spirit", gender: "Male", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Stun"] },
  "Braum":          { regions: ["Freljord"], species: "Human", gender: "Male", roles: ["Support", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2014, traits: ["Stun", "Knockup", "Shield"] },
  "Briar":          { regions: ["Noxus"], species: "Monster/Beast", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Manaless", ranges: ["Melee"], year: 2023, traits: ["Stun", "Fear", "Dash", "Global Ult"] },
  "Caitlyn":        { regions: ["Piltover"], species: "Human", gender: "Female", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Root", "Global Ult"] },
  "Camille":        { regions: ["Piltover"], species: "Human", gender: "Female", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2016, traits: ["True Damage", "Stun", "Shield", "Hook"] },
  "Cassiopeia":     { regions: ["Noxus", "Shurima"], species: "Monster/Beast", gender: "Female", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Stun", "Poison"] },
  "Cho'Gath":       { regions: ["Void"], species: "Monster/Beast", gender: "Indeterminate", roles: ["Tank", "Mage"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Knockup", "Silence", "True Damage"] },
  "Corki":          { regions: ["Bandle City", "Piltover"], species: "Yordle", gender: "Male", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Dash"] },
  "Darius":         { regions: ["Noxus"], species: "Human", gender: "Male", roles: ["Fighter"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Hook", "True Damage", "Bleed"] },
  "Diana":          { regions: ["Targon"], species: "Aspect/Celestial", gender: "Female", roles: ["Fighter", "Assassin", "Mage"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Knockup", "Dash", "Shield"] },
  "Dr. Mundo":      { regions: ["Zaun"], species: "Monster/Beast", gender: "Male", roles: ["Fighter", "Tank"], resource: "Health/Other", ranges: ["Melee"], year: 2009, traits: ["Shield"] },
  "Draven":         { regions: ["Noxus"], species: "Human", gender: "Male", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Knockup", "Global Ult"] },
  "Ekko":           { regions: ["Zaun"], species: "Human", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2015, traits: ["Stun", "Dash", "Blink", "Shield"] },
  "Evelynn":        { regions: ["Runeterra"], species: "Undead/Spirit", gender: "Female", roles: ["Assassin", "Mage"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Stealth", "Charm"] },
  "Ezreal":         { regions: ["Piltover"], species: "Human", gender: "Male", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Blink", "Global Ult"] },
  "Fiddlesticks":   { regions: ["Demacia", "Runeterra"], species: "Undead/Spirit", gender: "Indeterminate", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Fear", "Silence"] },
  "Fiora":          { regions: ["Demacia"], species: "Human", gender: "Female", roles: ["Fighter"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["True Damage", "Stun", "Dash"] },
  "Fizz":           { regions: ["Bilgewater", "Bandle City"], species: "Yordle", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Knockup", "Untargetable", "Dash"] },
  "Galio":          { regions: ["Demacia"], species: "Golem/Construct", gender: "Male", roles: ["Tank", "Mage", "Support"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Knockup", "Taunt", "Global Ult", "Shield"] },
  "Gangplank":      { regions: ["Bilgewater"], species: "Human", gender: "Male", roles: ["Fighter"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Global Ult", "True Damage"] },
  "Garen":          { regions: ["Demacia"], species: "Human", gender: "Male", roles: ["Fighter"], resource: "Manaless", ranges: ["Melee"], year: 2010, traits: ["True Damage", "Silence", "Shield"] },
  "Gragas":         { regions: ["Freljord"], species: "Human", gender: "Male", roles: ["Fighter", "Mage", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Knockup", "Stun", "Dash"] },
  "Graves":         { regions: ["Bilgewater"], species: "Human", gender: "Male", roles: ["Marksman", "Fighter"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Dash", "Blind"] },
  "Gwen":           { regions: ["Shadow Isles"], species: "Human", gender: "Female", roles: ["Fighter"], resource: "Mana", ranges: ["Melee"], year: 2021, traits: ["True Damage", "Dash", "Untargetable"] },
  "Hecarim":        { regions: ["Shadow Isles"], species: "Undead/Spirit", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Fear", "Knockup"] },
  "Heimerdinger":   { regions: ["Bandle City", "Piltover"], species: "Yordle", gender: "Male", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun"] },
  "Hwei":           { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2023, traits: ["Fear", "Root", "Shield"] },
  "Illaoi":         { regions: ["Bilgewater"], species: "Human", gender: "Female", roles: ["Fighter"], resource: "Mana", ranges: ["Melee"], year: 2015, traits: ["Hook"] },
  "Irelia":         { regions: ["Ionia"], species: "Human", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Stun", "Dash"] },
  "Ivern":          { regions: ["Ionia", "Freljord"], species: "Undead/Spirit", gender: "Male", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2016, traits: ["Root", "Shield", "Knockup"] },
  "Janna":          { regions: ["Zaun"], species: "Aspect/Celestial", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Knockup", "Shield"] },
  "Jarvan IV":      { regions: ["Demacia"], species: "Human", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Knockup", "Wall", "Shield"] },
  "Jax":            { regions: ["Shurima", "Runeterra"], species: "Human", gender: "Male", roles: ["Fighter", "Assassin"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Stun", "Dash"] },
  "Jhin":           { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2016, traits: ["Root"] },
  "Jinx":           { regions: ["Zaun", "Piltover"], species: "Human", gender: "Female", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2013, traits: ["Global Ult", "Root"] },
  "K'Sante":        { regions: ["Shurima"], species: "Human", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2022, traits: ["Knockup", "Shield", "True Damage"] },
  "Kai'Sa":         { regions: ["Void", "Shurima"], species: "Human", gender: "Female", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2018, traits: ["Shield", "Dash", "Stealth"] },
  "Kalista":        { regions: ["Shadow Isles"], species: "Undead/Spirit", gender: "Female", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2014, traits: ["Knockup", "Dash"] },
  "Karma":          { regions: ["Ionia"], species: "Human", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Root", "Shield"] },
  "Karthus":        { regions: ["Noxus", "Shadow Isles"], species: "Undead/Spirit", gender: "Male", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Global Ult", "Wall"] },
  "Kassadin":       { regions: ["Shurima", "Void"], species: "Human", gender: "Male", roles: ["Assassin", "Mage"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Blink", "Silence", "Shield"] },
  "Katarina":       { regions: ["Noxus"], species: "Human", gender: "Female", roles: ["Assassin", "Mage"], resource: "Manaless", ranges: ["Melee"], year: 2009, traits: ["Blink"] },
  "Kayn":           { regions: ["Noxus", "Ionia"], species: "Human", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2017, traits: ["Untargetable", "Dash"] },
  "Kennen":         { regions: ["Bandle City", "Ionia"], species: "Yordle", gender: "Male", roles: ["Mage", "Marksman"], resource: "Energy", ranges: ["Ranged"], year: 2010, traits: ["Stun"] },
  "Kha'Zix":        { regions: ["Void", "Ixtal"], species: "Monster/Beast", gender: "Indeterminate", roles: ["Assassin"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Stealth", "Dash"] },
  "Kindred":        { regions: ["Runeterra"], species: "Undead/Spirit", gender: "Indeterminate", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2015, traits: ["Invulnerable", "Dash"] },
  "Kled":           { regions: ["Bandle City", "Noxus"], species: "Yordle", gender: "Male", roles: ["Fighter", "Tank"], resource: "Manaless", ranges: ["Melee"], year: 2016, traits: ["Hook", "Shield"] },
  "Kog'Maw":        { regions: ["Void"], species: "Monster/Beast", gender: "Indeterminate", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["True Damage"] },
  "LeBlanc":        { regions: ["Noxus"], species: "Human", gender: "Female", roles: ["Assassin", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Root", "Blink", "Stealth"] },
  "Lee Sin":        { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Fighter", "Assassin"], resource: "Energy", ranges: ["Melee"], year: 2011, traits: ["Knockup", "Shield", "Dash"] },
  "Leona":          { regions: ["Targon"], species: "Aspect/Celestial", gender: "Female", roles: ["Tank", "Support"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Stun", "Root", "Shield"] },
  "Lillia":         { regions: ["Ionia"], species: "Monster/Beast", gender: "Female", roles: ["Fighter", "Mage"], resource: "Mana", ranges: ["Melee"], year: 2020, traits: ["Sleep", "True Damage"] },
  "Lissandra":      { regions: ["Freljord"], species: "Human", gender: "Female", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2013, traits: ["Stun", "Root", "Blink"] },
  "Locke":          { regions: ["Piltover", "Zaun"], species: "Human", gender: "Male", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2025, traits: ["Stealth", "Dash"] },
  "Lucian":         { regions: ["Demacia", "Shadow Isles"], species: "Human", gender: "Male", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2013, traits: ["Dash"] },
  "Lulu":           { regions: ["Bandle City", "Ionia"], species: "Yordle", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Knockup", "Shield"] },
  "Lux":            { regions: ["Demacia"], species: "Human", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Root", "Shield"] },
  "Malphite":       { regions: ["Ixtal", "Shurima"], species: "Golem/Construct", gender: "Indeterminate", roles: ["Tank", "Fighter", "Mage"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Knockup", "Shield"] },
  "Malzahar":       { regions: ["Shurima", "Void"], species: "Human", gender: "Male", roles: ["Mage", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Suppression", "Silence", "Shield"] },
  "Maokai":         { regions: ["Shadow Isles"], species: "Monster/Beast", gender: "Male", roles: ["Tank", "Mage", "Support"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Root", "Knockup"] },
  "Master Yi":      { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["True Damage", "Untargetable"] },
  "Mel":            { regions: ["Noxus", "Piltover"], species: "Human", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2025, traits: ["Shield", "Stun"] },
  "Milio":          { regions: ["Ixtal"], species: "Human", gender: "Male", roles: ["Support"], resource: "Mana", ranges: ["Ranged"], year: 2023, traits: ["Knockup", "Shield"] },
  "Miss Fortune":   { regions: ["Bilgewater"], species: "Human", gender: "Female", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: [] },
  "Mordekaiser":    { regions: ["Noxus", "Shadow Isles"], species: "Undead/Spirit", gender: "Male", roles: ["Fighter", "Mage"], resource: "Shield/Other", ranges: ["Melee"], year: 2010, traits: ["Hook", "Shield"] },
  "Morgana":        { regions: ["Demacia", "Targon"], species: "Aspect/Celestial", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Root", "Stun", "Shield"] },
  "Naafiri":        { regions: ["Shurima"], species: "Darkin", gender: "Female", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2023, traits: ["Dash"] },
  "Nami":           { regions: ["Bilgewater", "Targon"], species: "Vastaya", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Knockup", "Stun"] },
  "Nasus":          { regions: ["Shurima"], species: "Aspect/Celestial", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: [] },
  "Nautilus":       { regions: ["Bilgewater"], species: "Golem/Construct", gender: "Male", roles: ["Tank", "Support", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Hook", "Root", "Knockup", "Shield"] },
  "Neeko":          { regions: ["Ixtal"], species: "Vastaya", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2018, traits: ["Root", "Stun", "Stealth", "Shield"] },
  "Nilah":          { regions: ["Bilgewater"], species: "Human", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Mana", ranges: ["Melee"], year: 2022, traits: ["Knockup", "Dash", "Shield"] },
  "Nocturne":       { regions: ["Demacia", "Runeterra"], species: "Undead/Spirit", gender: "Indeterminate", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Fear", "Global Ult", "Shield"] },
  "Nunu & Willump": { regions: ["Freljord"], species: "Monster/Beast", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Knockup", "Root", "Shield"] },
  "Olaf":           { regions: ["Freljord", "Bilgewater"], species: "Human", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["True Damage", "Shield"] },
  "Orianna":        { regions: ["Piltover", "Zaun"], species: "Golem/Construct", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Knockup", "Shield"] },
  "Ornn":           { regions: ["Freljord"], species: "Aspect/Celestial", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2017, traits: ["Knockup", "Brittle"] },
  "Pantheon":       { regions: ["Targon"], species: "Human", gender: "Male", roles: ["Fighter", "Assassin", "Support"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Stun", "Global Ult", "Invulnerable"] },
  "Poppy":          { regions: ["Bandle City", "Demacia"], species: "Yordle", gender: "Female", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Stun", "Knockup", "Shield"] },
  "Pyke":           { regions: ["Bilgewater"], species: "Undead/Spirit", gender: "Male", roles: ["Support", "Assassin"], resource: "Mana", ranges: ["Melee"], year: 2018, traits: ["Hook", "Stun", "Stealth", "True Damage"] },
  "Qiyana":         { regions: ["Ixtal"], species: "Human", gender: "Female", roles: ["Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2019, traits: ["Stun", "Root", "Stealth", "Dash"] },
  "Quinn":          { regions: ["Demacia"], species: "Human", gender: "Female", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2013, traits: ["Blind", "Knockup"] },
  "Rhaast":         { regions: ["Runeterra", "Ionia", "Shurima"], species: "Darkin", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2017, traits: ["Knockup", "Dash"] },
  "Rakan":          { regions: ["Ionia"], species: "Vastaya", gender: "Male", roles: ["Support"], resource: "Mana", ranges: ["Ranged"], year: 2017, traits: ["Charm", "Knockup", "Shield", "Dash"] },
  "Rammus":         { regions: ["Shurima"], species: "Monster/Beast", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Taunt", "Knockup"] },
  "Rek'Sai":        { regions: ["Void", "Shurima"], species: "Monster/Beast", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Fury/Other", ranges: ["Melee"], year: 2014, traits: ["Knockup", "Dash"] },
  "Rell":           { regions: ["Noxus"], species: "Human", gender: "Female", roles: ["Tank", "Support"], resource: "Mana", ranges: ["Melee"], year: 2020, traits: ["Knockup", "Stun", "Shield"] },
  "Renata Glasc":   { regions: ["Zaun", "Piltover"], species: "Human", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2022, traits: ["Root", "Berserk", "Shield", "Hook"] },
  "Renekton":       { regions: ["Shurima"], species: "Aspect/Celestial", gender: "Male", roles: ["Fighter", "Tank"], resource: "Fury/Other", ranges: ["Melee"], year: 2011, traits: ["Stun", "Dash"] },
  "Rengar":         { regions: ["Ixtal", "Shurima"], species: "Vastaya", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Fury/Other", ranges: ["Melee"], year: 2012, traits: ["Root", "Stealth", "Dash"] },
  "Riven":          { regions: ["Noxus", "Ionia"], species: "Human", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Manaless", ranges: ["Melee"], year: 2011, traits: ["Knockup", "Stun", "Shield", "Dash"] },
  "Rumble":         { regions: ["Bandle City", "Shurima"], species: "Yordle", gender: "Male", roles: ["Fighter", "Mage"], resource: "Heat/Other", ranges: ["Melee"], year: 2011, traits: ["Shield"] },
  "Ryze":           { regions: ["Runeterra", "Noxus"], species: "Human", gender: "Male", roles: ["Mage", "Fighter"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Root", "Global Ult"] },
  "Sejuani":        { regions: ["Freljord"], species: "Human", gender: "Female", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Stun", "Knockup", "Dash"] },
  "Senna":          { regions: ["Demacia", "Shadow Isles"], species: "Undead/Spirit", gender: "Female", roles: ["Support", "Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2019, traits: ["Root", "Stealth", "Global Ult", "Shield"] },
  "Seraphine":      { regions: ["Piltover", "Zaun"], species: "Human", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2020, traits: ["Charm", "Root", "Stun", "Shield"] },
  "Sett":           { regions: ["Ionia", "Noxus"], species: "Vastaya", gender: "Male", roles: ["Fighter"], resource: "Grit/Other", ranges: ["Melee"], year: 2020, traits: ["True Damage", "Knockup", "Stun", "Shield"] },
  "Shaco":          { regions: ["Runeterra"], species: "Undead/Spirit", gender: "Indeterminate", roles: ["Assassin"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Stealth", "Fear", "Blink"] },
  "Shen":           { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Tank", "Support"], resource: "Energy", ranges: ["Melee"], year: 2010, traits: ["Global Ult", "Taunt", "Shield"] },
  "Shyvana":        { regions: ["Demacia"], species: "Monster/Beast", gender: "Female", roles: ["Fighter", "Tank", "Mage"], resource: "Fury/Other", ranges: ["Melee"], year: 2011, traits: ["Knockup"] },
  "Singed":         { regions: ["Zaun", "Piltover", "Noxus"], species: "Human", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Root", "Ground"] },
  "Sion":           { regions: ["Noxus"], species: "Undead/Spirit", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Knockup", "Stun", "Shield"] },
  "Sivir":          { regions: ["Shurima"], species: "Human", gender: "Female", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Shield"] },
  "Skarner":        { regions: ["Ixtal", "Shurima"], species: "Monster/Beast", gender: "Male", roles: ["Tank", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Suppression", "Stun", "Shield"] },
  "Smolder":        { regions: ["Noxus"], species: "Monster/Beast", gender: "Male", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2024, traits: ["True Damage"] },
  "Sona":           { regions: ["Ionia", "Demacia"], species: "Human", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Stun", "Shield"] },
  "Soraka":         { regions: ["Targon", "Ionia"], species: "Aspect/Celestial", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Silence", "Root", "Global Ult"] },
  "Swain":          { regions: ["Noxus"], species: "Human", gender: "Male", roles: ["Mage", "Fighter", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Root", "Hook"] },
  "Sylas":          { regions: ["Demacia", "Freljord"], species: "Human", gender: "Male", roles: ["Mage", "Assassin", "Fighter"], resource: "Mana", ranges: ["Melee"], year: 2019, traits: ["Dash", "Hook", "Shield"] },
  "Syndra":         { regions: ["Ionia"], species: "Human", gender: "Female", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Stun", "Knockup", "True Damage"] },
  "Tahm Kench":     { regions: ["Bilgewater", "Runeterra"], species: "Undead/Spirit", gender: "Male", roles: ["Support", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2015, traits: ["Stun", "Knockup", "Shield"] },
  "Taliyah":        { regions: ["Shurima", "Ionia"], species: "Human", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2016, traits: ["Knockup", "Wall"] },
  "Talon":          { regions: ["Noxus"], species: "Human", gender: "Male", roles: ["Assassin"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Stealth", "Bleed"] },
  "Taric":          { regions: ["Demacia", "Targon"], species: "Aspect/Celestial", gender: "Male", roles: ["Support", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Stun", "Invulnerable", "Shield"] },
  "Teemo":          { regions: ["Bandle City"], species: "Yordle", gender: "Male", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stealth", "Blind"] },
  "Thresh":         { regions: ["Shadow Isles"], species: "Undead/Spirit", gender: "Male", roles: ["Support", "Tank"], resource: "Mana", ranges: ["Ranged"], year: 2013, traits: ["Hook", "Knockup", "Shield"] },
  "Tristana":       { regions: ["Bandle City"], species: "Yordle", gender: "Female", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Knockup", "Dash"] },
  "Trundle":        { regions: ["Freljord"], species: "Monster/Beast", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Pillar"] },
  "Tryndamere":     { regions: ["Freljord"], species: "Human", gender: "Male", roles: ["Fighter", "Assassin"], resource: "Fury/Other", ranges: ["Melee"], year: 2009, traits: ["Invulnerable", "Dash"] },
  "Twisted Fate":   { regions: ["Bilgewater"], species: "Human", gender: "Male", roles: ["Mage", "Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun", "Global Ult"] },
  "Twitch":         { regions: ["Zaun"], species: "Monster/Beast", gender: "Male", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stealth", "True Damage"] },
  "Udyr":           { regions: ["Freljord", "Ionia"], species: "Human", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Stun", "Shield"] },
  "Urgot":          { regions: ["Noxus", "Zaun"], species: "Human", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Ranged"], year: 2010, traits: ["Shield", "Execute"] },
  "Varus":          { regions: ["Shurima", "Ionia"], species: "Darkin", gender: "Male", roles: ["Marksman", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Root", "Blight"] },
  "Vayne":          { regions: ["Demacia"], species: "Human", gender: "Female", roles: ["Marksman", "Assassin"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["True Damage", "Stealth", "Stun", "Dash"] },
  "Veigar":         { regions: ["Bandle City", "Noxus"], species: "Yordle", gender: "Male", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun"] },
  "Vel'Koz":        { regions: ["Void"], species: "Monster/Beast", gender: "Indeterminate", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2014, traits: ["True Damage", "Knockup"] },
  "Vex":            { regions: ["Bandle City", "Shadow Isles"], species: "Yordle", gender: "Female", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2021, traits: ["Fear", "Shield", "Dash"] },
  "Vi":             { regions: ["Zaun", "Piltover"], species: "Human", gender: "Female", roles: ["Fighter", "Assassin"], resource: "Mana", ranges: ["Melee"], year: 2012, traits: ["Knockup", "Shield", "Dash"] },
  "Viego":          { regions: ["Shadow Isles"], species: "Undead/Spirit", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Manaless", ranges: ["Melee"], year: 2021, traits: ["Stun", "Stealth", "Invulnerable", "Dash"] },
  "Viktor":         { regions: ["Zaun", "Piltover"], species: "Human", gender: "Male", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Stun", "Shield"] },
  "Vladimir":       { regions: ["Noxus", "Shadow Isles"], species: "Human", gender: "Male", roles: ["Mage", "Tank"], resource: "Manaless", ranges: ["Ranged"], year: 2010, traits: ["Untargetable"] },
  "Volibear":       { regions: ["Freljord"], species: "Aspect/Celestial", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Stun", "Shield", "Disabled Turret"] },
  "Warwick":        { regions: ["Zaun"], species: "Monster/Beast", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2009, traits: ["Suppression", "Fear"] },
  "Wukong":         { regions: ["Ionia"], species: "Vastaya", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Knockup", "Stealth", "Dash"] },
  "Xayah":          { regions: ["Ionia"], species: "Vastaya", gender: "Female", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2017, traits: ["Root", "Untargetable"] },
  "Xerath":         { regions: ["Shurima"], species: "Aspect/Celestial", gender: "Male", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2011, traits: ["Stun", "Global Ult"] },
  "Xin Zhao":       { regions: ["Ionia", "Noxus", "Demacia"], species: "Human", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2010, traits: ["Knockup", "Dash"] },
  "Yasuo":          { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Fighter", "Assassin"], resource: "Manaless", ranges: ["Melee"], year: 2013, traits: ["Knockup", "Shield", "Dash"] },
  "Yone":           { regions: ["Ionia"], species: "Undead/Spirit", gender: "Male", roles: ["Assassin", "Fighter"], resource: "Manaless", ranges: ["Melee"], year: 2020, traits: ["Knockup", "True Damage", "Shield", "Dash"] },
  "Yorick":         { regions: ["Shadow Isles"], species: "Human", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2011, traits: ["Wall"] },
  "Yuumi":          { regions: ["Bandle City"], species: "Monster/Beast", gender: "Female", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2019, traits: ["Root", "Untargetable", "Shield"] },
  "Zaahen":         { regions: ["Ionia", "Shurima", "Runeterra"], species: "Darkin", gender: "Male", roles: ["Fighter", "Tank"], resource: "Mana", ranges: ["Melee"], year: 2024, traits: ["Knockup", "Dash"] },
  "Zac":            { regions: ["Zaun"], species: "Golem/Construct", gender: "Indeterminate", roles: ["Tank", "Support"], resource: "Health/Other", ranges: ["Melee"], year: 2013, traits: ["Knockup", "Elastic Slingshot"] },
  "Zed":            { regions: ["Ionia"], species: "Human", gender: "Male", roles: ["Assassin"], resource: "Energy", ranges: ["Melee"], year: 2012, traits: ["Shadow/Blink"] },
  "Zeri":           { regions: ["Zaun"], species: "Human", gender: "Female", roles: ["Marksman"], resource: "Mana", ranges: ["Ranged"], year: 2022, traits: ["Shield", "Dash"] },
  "Ziggs":          { regions: ["Bandle City", "Zaun", "Piltover"], species: "Yordle", gender: "Male", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Knockup", "Global Ult"] },
  "Zilean":         { regions: ["Shurima", "Runeterra"], species: "Human", gender: "Male", roles: ["Support", "Mage"], resource: "Mana", ranges: ["Ranged"], year: 2009, traits: ["Stun", "Revive"] },
  "Zoe":            { regions: ["Targon"], species: "Aspect/Celestial", gender: "Female", roles: ["Mage"], resource: "Mana", ranges: ["Ranged"], year: 2017, traits: ["Sleep", "Blink", "True Damage"] },
  "Zyra":           { regions: ["Ixtal", "Shurima"], species: "Monster/Beast", gender: "Female", roles: ["Mage", "Support"], resource: "Mana", ranges: ["Ranged"], year: 2012, traits: ["Root", "Knockup"] }
};

// 2. CRITERIA POOL WITH WEIGHTS
const CRITERIA_METADATA = [
  // REGION (Quota: 7)
  { name: "Ionia", cat: "REGION", color: "#38bdf8", weight: 22 },
  { name: "Noxus", cat: "REGION", color: "#38bdf8", weight: 18 },
  { name: "Piltover", cat: "REGION", color: "#38bdf8", weight: 14 },
  { name: "Zaun", cat: "REGION", color: "#38bdf8", weight: 16 },
  { name: "Demacia", cat: "REGION", color: "#38bdf8", weight: 16 },
  { name: "Freljord", cat: "REGION", color: "#38bdf8", weight: 15 },
  { name: "Shurima", cat: "REGION", color: "#38bdf8", weight: 16 },
  { name: "Shadow Isles", cat: "REGION", color: "#38bdf8", weight: 12 },
  { name: "Bilgewater", cat: "REGION", color: "#38bdf8", weight: 13 },
  { name: "Bandle City", cat: "REGION", color: "#38bdf8", weight: 12 },
  { name: "Targon", cat: "REGION", color: "#38bdf8", weight: 9 },
  { name: "Void", cat: "REGION", color: "#38bdf8", weight: 9 },
  { name: "Ixtal", cat: "REGION", color: "#38bdf8", weight: 8 },

  // SPECIES (Quota: 4)
  { name: "Human", cat: "SPECIES", color: "#a855f7", weight: 30 },
  { name: "Monster/Beast", cat: "SPECIES", color: "#a855f7", weight: 18 },
  { name: "Aspect/Celestial", cat: "SPECIES", color: "#a855f7", weight: 14 },
  { name: "Undead/Spirit", cat: "SPECIES", color: "#a855f7", weight: 14 },
  { name: "Yordle", cat: "SPECIES", color: "#a855f7", weight: 12 },
  { name: "Vastaya", cat: "SPECIES", color: "#a855f7", weight: 10 },
  { name: "Golem/Construct", cat: "SPECIES", color: "#a855f7", weight: 7 },
  { name: "Darkin", cat: "SPECIES", color: "#a855f7", weight: 5 },

  // GENDER (Quota: 2)
  { name: "Male", cat: "GENDER", color: "#ec4899", weight: 25 },
  { name: "Female", cat: "GENDER", color: "#ec4899", weight: 25 },
  { name: "Indeterminate", cat: "GENDER", color: "#ec4899", weight: 10 },

  // YEAR (Quota: 3)
  { name: "Released 2009-2013", cat: "YEAR", color: "#facc15", weight: 35 },
  { name: "Released 2014-2018", cat: "YEAR", color: "#facc15", weight: 25 },
  { name: "Released 2019-2023", cat: "YEAR", color: "#facc15", weight: 25 },
  { name: "Released 2023+", cat: "YEAR", color: "#facc15", weight: 10 },

  // ROLE (Quota: 5)
  { name: "Fighter", cat: "ROLE", color: "#f97316", weight: 20 },
  { name: "Mage", cat: "ROLE", color: "#f97316", weight: 20 },
  { name: "Tank", cat: "ROLE", color: "#f97316", weight: 18 },
  { name: "Marksman", cat: "ROLE", color: "#f97316", weight: 18 },
  { name: "Assassin", cat: "ROLE", color: "#f97316", weight: 18 },
  { name: "Support", cat: "ROLE", color: "#f97316", weight: 18 },

  // RESOURCE (Quota: 3)
  { name: "Mana", cat: "RESOURCE", color: "#4ade80", weight: 30 },
  { name: "Manaless", cat: "RESOURCE", color: "#4ade80", weight: 20 },
  { name: "Energy", cat: "RESOURCE", color: "#4ade80", weight: 12 },

  // RANGE (Quota: 2)
  { name: "Melee", cat: "RANGE", color: "#e2e8f0", weight: 20 },
  { name: "Ranged", cat: "RANGE", color: "#e2e8f0", weight: 20 },

  // MECH (Quota: 5)
  { name: "Knockup", cat: "MECH", color: "#c084fc", weight: 20 },
  { name: "Stun", cat: "MECH", color: "#c084fc", weight: 20 },
  { name: "Shield", cat: "MECH", color: "#c084fc", weight: 20 },
  { name: "Dash", cat: "MECH", color: "#c084fc", weight: 20 },
  { name: "Root", cat: "MECH", color: "#c084fc", weight: 18 },
  { name: "True Damage", cat: "MECH", color: "#c084fc", weight: 16 },
  { name: "Stealth", cat: "MECH", color: "#c084fc", weight: 14 },
  { name: "Global Ult", cat: "MECH", color: "#c084fc", weight: 12 }
];

const CATEGORY_QUOTAS = {
  REGION: 7,
  ROLE: 5,
  MECH: 5,
  SPECIES: 4,
  YEAR: 3,
  RESOURCE: 3,
  RANGE: 2,
  GENDER: 2
};

const AXIAL_DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

function pickWeightedUnique(pool, count) {
  const selected = [];
  const available = [...pool];

  for (let k = 0; k < count && available.length > 0; k++) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    for (let i = 0; i < available.length; i++) {
      rand -= available[i].weight;
      if (rand <= 0) {
        selected.push(available[i]);
        available.splice(i, 1);
        break;
      }
    }
  }

  return selected;
}

function selectBalancedCriteria() {
  const chosenCriteria = [];
  for (const [category, quota] of Object.entries(CATEGORY_QUOTAS)) {
    const categoryPool = CRITERIA_METADATA.filter(c => c.cat === category);
    chosenCriteria.push(...pickWeightedUnique(categoryPool, quota));
  }
  return chosenCriteria.sort(() => 0.5 - Math.random());
}

function matchesCriteria(champName, crit) {
  const c = CHAMPIONS[champName];
  if (!c) return false;

  if (Array.isArray(c.regions) && c.regions.includes(crit)) return true;
  if (c.region === crit) return true;

  if (Array.isArray(c.ranges) && c.ranges.includes(crit)) return true;
  if (c.range === crit) return true;

  if (Array.isArray(c.roles) && c.roles.includes(crit)) return true;
  if (c.role === crit) return true;

  if (c.species === crit) return true;
  if (c.gender === crit) return true;
  if (c.traits && c.traits.includes(crit)) return true;

  if (crit === "Manaless") {
    if (c.resource === "Manaless" || (c.resource && c.resource.includes("/Other"))) return true;
  } else if (c.resource === crit) {
    return true;
  }

  if (crit === "Released 2009-2013" && (c.year >= 2009 && c.year <= 2013)) return true;
  if (crit === "Released 2014-2018" && (c.year >= 2014 && c.year <= 2018)) return true;
  if (crit === "Released 2019-2023" && (c.year >= 2019 && c.year <= 2023)) return true;
  if (crit === "Released 2023+" && c.year > 2023) return true;

  return false;
}

function generateBoard() {
  const corners = new Set(["0,-3", "3,-3", "3,0", "0,3", "-3,3", "-3,0"]);
  const coords = [];

  for (let q = -3; q <= 3; q++) {
    const r1 = Math.max(-3, -q - 3);
    const r2 = Math.min(3, -q + 3);
    for (let r = r1; r <= r2; r++) {
      if (!corners.has(`${q},${r}`)) coords.push({ q, r });
    }
  }

  const selectedCriteria = selectBalancedCriteria();

  const board = coords.map((c, i) => ({
    id: `hex_${c.q}_${c.r}`,
    q: c.q,
    r: c.r,
    owner: 0,
    criteriaObj: selectedCriteria[i]
  }));

  for (let s = 0; s < 180; s++) {
    for (let i = 0; i < board.length; i++) {
      const tile = board[i];
      const neighbors = board.filter(b =>
        AXIAL_DIRECTIONS.some(d => (tile.q + d.q === b.q) && (tile.r + d.r === b.r))
      );
      if (neighbors.some(n => n.criteriaObj.cat === tile.criteriaObj.cat)) {
        const rand = Math.floor(Math.random() * board.length);
        const temp = board[i].criteriaObj;
        board[i].criteriaObj = board[rand].criteriaObj;
        board[rand].criteriaObj = temp;
      }
    }
  }
  return board;
}

function findConnectedChain(room, targetHex, champName, playerNum) {
  const visited = new Set();
  const queue = [targetHex];
  visited.add(targetHex.id);

  const claimedHexIds = [];

  while (queue.length > 0) {
    const current = queue.shift();

    const physicalNeighbors = room.board.filter(b =>
      AXIAL_DIRECTIONS.some(d => (current.q + d.q === b.q) && (current.r + d.r === b.r))
    );

    for (const neighbor of physicalNeighbors) {
      if (visited.has(neighbor.id)) continue;

      if (matchesCriteria(champName, neighbor.criteriaObj.name)) {
        visited.add(neighbor.id);
        queue.push(neighbor);

        if (neighbor.owner !== playerNum) {
          neighbor.owner = playerNum;
          claimedHexIds.push(neighbor.id);
        }
      }
    }
  }

  return claimedHexIds;
}

// 3. ROOM & MATCHMAKING ENGINE
const rooms = new Map();

function createRoom(code, initialSettings = {}) {
  const chainingEnabled = initialSettings.chainingEnabled !== undefined ? Boolean(initialSettings.chainingEnabled) : false;
  const championLocking = initialSettings.championLocking !== undefined ? Boolean(initialSettings.championLocking) : true;
  const parsedDuration = parseInt(initialSettings.roundDuration, 10);
  const roundDuration = [30, 60, 0].includes(parsedDuration) ? parsedDuration : 30;

  return {
    code,
    players: {},
    board: generateBoard(),
    currentPlayer: 1, // 1: Blue, 2: Red
    usedChampions: [],
    timer: null,
    timeLeft: roundDuration,
    roundDuration,
    gameStarted: false,
    chainingEnabled,
    championLocking
  };
}

function startTurnTimer(room) {
  if (room.timer) clearInterval(room.timer);

  if (room.roundDuration === 0) {
    room.timeLeft = 0;
    io.to(room.code).emit('timerUpdate', { timeLeft: 0, totalDuration: 0 });
    return;
  }

  room.timeLeft = room.roundDuration;
  io.to(room.code).emit('timerUpdate', {
    timeLeft: room.timeLeft,
    totalDuration: room.roundDuration
  });

  room.timer = setInterval(() => {
    room.timeLeft--;
    io.to(room.code).emit('timerUpdate', {
      timeLeft: room.timeLeft,
      totalDuration: room.roundDuration
    });

    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      const timedOutPlayer = room.currentPlayer;
      room.currentPlayer = room.currentPlayer === 1 ? 2 : 1;
      io.to(room.code).emit('turnPass', {
        reason: `Player ${timedOutPlayer} ran out of time! Turn passed.`,
        currentPlayer: room.currentPlayer
      });
      startTurnTimer(room);
    }
  }, 1000);
}

io.on('connection', (socket) => {
  let userRoomCode = null;

  socket.on('joinRoom', ({ roomCode, settings }) => {
    const code = (roomCode || '').trim().toUpperCase();
    if (!code) return;

    let room = rooms.get(code);
    if (!room) {
      room = createRoom(code, settings);
      rooms.set(code, room);
    }

    const currentCount = Object.keys(room.players).length;
    if (currentCount >= 2 && !room.players[socket.id]) {
      socket.emit('errorMsg', 'Room is currently full (2 players maximum).');
      return;
    }

    const playerNum = currentCount === 0 ? 1 : 2;
    room.players[socket.id] = { playerNum };
    userRoomCode = code;
    socket.join(code);

    // If Player 1 provides settings on join, ensure room uses them
    if (playerNum === 1 && settings) {
      if (settings.chainingEnabled !== undefined) {
        room.chainingEnabled = Boolean(settings.chainingEnabled);
      }
      if (settings.championLocking !== undefined) {
        room.championLocking = Boolean(settings.championLocking);
      }
      const dur = parseInt(settings.roundDuration, 10);
      if ([30, 60, 0].includes(dur)) {
        room.roundDuration = dur;
      }
    }

    socket.emit('initSession', {
      playerNum,
      board: room.board,
      currentPlayer: room.currentPlayer,
      usedChampions: room.usedChampions,
      championPool: Object.keys(CHAMPIONS),
      chainingEnabled: room.chainingEnabled,
      championLocking: room.championLocking,
      roundDuration: room.roundDuration
    });

    const activePlayers = Object.values(room.players);
    if (activePlayers.length === 2 && !room.gameStarted) {
      room.gameStarted = true;
      io.to(code).emit('gameStart', {
        currentPlayer: room.currentPlayer,
        chainingEnabled: room.chainingEnabled,
        championLocking: room.championLocking,
        roundDuration: room.roundDuration
      });
      startTurnTimer(room);
    }
  });

  socket.on('toggleChaining', ({ enabled }) => {
    const room = rooms.get(userRoomCode);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || player.playerNum !== 1) return;

    room.chainingEnabled = Boolean(enabled);
    io.to(room.code).emit('settingsUpdated', {
      chainingEnabled: room.chainingEnabled,
      championLocking: room.championLocking,
      roundDuration: room.roundDuration,
      message: `Host set Hex Chaining: ${room.chainingEnabled ? 'ON' : 'OFF'}`
    });
  });

  socket.on('toggleChampionLocking', ({ enabled }) => {
    const room = rooms.get(userRoomCode);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || player.playerNum !== 1) return;

    room.championLocking = Boolean(enabled);
    io.to(room.code).emit('settingsUpdated', {
      chainingEnabled: room.chainingEnabled,
      championLocking: room.championLocking,
      roundDuration: room.roundDuration,
      message: `Host set Champion Locking: ${room.championLocking ? 'ON' : 'OFF'}`
    });
  });

  socket.on('setRoundDuration', ({ duration }) => {
    const room = rooms.get(userRoomCode);
    if (!room) return;
    const player = room.players[socket.id];
    if (!player || player.playerNum !== 1) return;

    const parsed = parseInt(duration, 10);
    if ([30, 60, 0].includes(parsed)) {
      room.roundDuration = parsed;
      io.to(room.code).emit('settingsUpdated', {
        chainingEnabled: room.chainingEnabled,
        championLocking: room.championLocking,
        roundDuration: room.roundDuration,
        message: `Host set Turn Timer: ${parsed === 0 ? 'Unlimited' : parsed + 's'}`
      });
      if (room.gameStarted) {
        startTurnTimer(room);
      }
    }
  });

  socket.on('submitMove', ({ hexId, champName }) => {
    const room = rooms.get(userRoomCode);
    if (!room) return;

    const player = room.players[socket.id];
    if (!player || player.playerNum !== room.currentPlayer) {
      socket.emit('errorMsg', "It is not your turn!");
      return;
    }

    const targetHex = room.board.find(h => h.id === hexId);
    if (!targetHex || targetHex.owner !== 0) {
      socket.emit('errorMsg', "Target must be an unclaimed, neutral hex!");
      return;
    }

    const rawInput = (champName || '').trim();
    let validKey = Object.keys(CHAMPIONS).find(k => k.toLowerCase() === rawInput.toLowerCase());

    // Resolve partial / prefix champion names (e.g. "voli" -> "Volibear")
    if (!validKey && rawInput.length >= 2) {
      const lower = rawInput.toLowerCase();
      const starts = Object.keys(CHAMPIONS).filter(k => k.toLowerCase().startsWith(lower));
      if (starts.length > 0) {
        if (room.championLocking) {
          const unlocked = starts.find(k => !room.usedChampions.includes(k));
          validKey = unlocked || starts[0];
        } else {
          validKey = starts[0];
        }
      } else {
        const contains = Object.keys(CHAMPIONS).filter(k => k.toLowerCase().includes(lower));
        if (contains.length > 0) {
          if (room.championLocking) {
            const unlocked = contains.find(k => !room.usedChampions.includes(k));
            validKey = unlocked || contains[0];
          } else {
            validKey = contains[0];
          }
        }
      }
    }

    function handleMistake(reason) {
      io.to(room.code).emit('hexVibrate', {
        hexId: targetHex.id,
        reason,
        playerNum: room.currentPlayer
      });
      passTurn(room, reason);
    }

    if (!validKey) {
      handleMistake(`Unknown champion "${champName}"! Turn passes.`);
      return;
    }

    if (room.championLocking && room.usedChampions.includes(validKey)) {
      handleMistake(`"${validKey}" was already locked! Turn passes.`);
      return;
    }

    if (!matchesCriteria(validKey, targetHex.criteriaObj.name)) {
      handleMistake(`"${validKey}" does not match [${targetHex.criteriaObj.name}]! Turn passes.`);
      return;
    }

    if (room.championLocking) {
      room.usedChampions.push(validKey);
    }
    targetHex.owner = room.currentPlayer;

    let stolenHexIds = [];

    if (room.chainingEnabled) {
      stolenHexIds = findConnectedChain(room, targetHex, validKey, room.currentPlayer);
    } else {
      const neighbors = room.board.filter(b =>
        AXIAL_DIRECTIONS.some(d => (targetHex.q + d.q === b.q) && (targetHex.r + d.r === b.r))
      );
      neighbors.forEach(n => {
        if (matchesCriteria(validKey, n.criteriaObj.name) && n.owner !== room.currentPlayer) {
          n.owner = room.currentPlayer;
          stolenHexIds.push(n.id);
        }
      });
    }

    const unowned = room.board.filter(h => h.owner === 0).length;
    const p1Count = room.board.filter(h => h.owner === 1).length;
    const p2Count = room.board.filter(h => h.owner === 2).length;

    io.to(room.code).emit('moveSuccess', {
      primaryHexId: targetHex.id,
      stolenHexIds,
      playerNum: room.currentPlayer,
      champName: validKey,
      p1Score: p1Count,
      p2Score: p2Count,
      unowned,
      chained: room.chainingEnabled
    });

    if (unowned === 0) {
      if (room.timer) clearInterval(room.timer);
      let winner = 0;
      if (p1Count > p2Count) winner = 1;
      else if (p2Count > p1Count) winner = 2;
      io.to(room.code).emit('gameOver', { winner, p1Score: p1Count, p2Score: p2Count });
      return;
    }

    room.currentPlayer = room.currentPlayer === 1 ? 2 : 1;
    io.to(room.code).emit('turnPass', {
      reason: `${validKey} claimed ${1 + stolenHexIds.length} hex(es)!`,
      currentPlayer: room.currentPlayer
    });
    startTurnTimer(room);
  });

  function passTurn(room, reason) {
    room.currentPlayer = room.currentPlayer === 1 ? 2 : 1;
    io.to(room.code).emit('turnPass', {
      reason,
      currentPlayer: room.currentPlayer
    });
    startTurnTimer(room);
  }

  socket.on('disconnect', () => {
    if (userRoomCode && rooms.has(userRoomCode)) {
      const room = rooms.get(userRoomCode);
      delete room.players[socket.id];
      if (Object.keys(room.players).length === 0) {
        if (room.timer) clearInterval(room.timer);
        rooms.delete(userRoomCode);
      } else {
        io.to(userRoomCode).emit('playerDisconnected');
      }
    }
  });
});

// Render binding fix: 0.0.0.0 host binding + process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Rift Possession running on port ${PORT}`);
});