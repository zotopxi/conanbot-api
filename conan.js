const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('node:fs');

require('dotenv').config();

const conan = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

conan.commands = new Collection();
const prefix = process.env.PREFIX;
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (!('name' in command && 'execute' in command)) {
    console.warn(`[WARNING] Command in ${file} is missing a "name" or "execute" property.`);
    continue;
  }
  conan.commands.set(command.name, command);
  if (command.aliases && Array.isArray(command.aliases)) {
    for (const alias of command.aliases) {
      if (!conan.commands.has(alias)) {
        conan.commands.set(alias, command);
      } else {
        console.warn(`[WARNING] Alias "${alias}" in ${file} conflicts with an existing command/alias.`);
      }
    }
  }
}

conan.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${conan.user.tag}`);
});

conan.on(Events.MessageCreate, async message => {

  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = conan.commands.get(commandName) || 
                 conan.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  try {
    if (command.guildOnly && !message.guild) {
      return message.reply("❌ This command can only be used in a server!");
    }
  
    await command.execute(message, args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    if (error instanceof TypeError) {
      message.reply('❌ There was a problem processing that command (TypeError).');
    } else if (error instanceof RangeError) {
      message.reply('❌ Invalid arguments provided for that command.');
    } else {
      message.reply('❌ There was an unexpected error executing that command.');
    }
  }
});





/*
 * Copyright (c) 2025 zotopx
 * 
 * This file is part of conanbot-api, licensed under the MIT License.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
 */


conan.login(process.env.TOKEN);
