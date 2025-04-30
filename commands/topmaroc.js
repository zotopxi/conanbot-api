const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'topmaroc',
    description: 'Get the top 10 Moroccan servers by voice channel activity',
    guildOnly: false,
    aliases: ['topma', 'topmarocservers'],


     /*
 * @project    conanbot
 * @author     zotopx
 * @license    MIT
 * @copyright  Copyright (c) 2025 zotopx
 * @repo       https://github.com/zotopxi/conanbot-api
 */
    async execute(message, args) {
        try {
            const response = await fetch('https://conanbot.com/topma/api');
            const data = await response.json();
            if (!data.success) {
                return message.reply('❌ Failed to fetch data from the API.');
            }
            const topServers = data.top;
            if (topServers.length === 0) {
                return message.reply('No data available.');
            }
            const top1 = topServers[0];
            const authorIcon = top1.icon || 'https://conanbot.com/media/conanceoo.png';
            const topmaembed = new EmbedBuilder()
                .setAuthor({ name: 'Top Maroc Servers', iconURL: authorIcon })
                .setTimestamp()
                .setFooter({ text: 'Top Maroc Servers Community', iconURL: 'https://conanbot.com/media/conanceoo.png' })
                .setThumbnail('https://conanbot.com/media/conanceoo.png');
            topServers.forEach((server, index) => {
                topmaembed.addFields({
                    name: `> ${index + 1}. ${server.name}`,
                    value: `\`🔊\` \`${server.count}\` **members in voice**`,
                    inline: false
                });
            });
            await message.reply({ content: "-# <https://conanbot.com/dashboard>",embeds: [topmaembed] });
        } catch (error) {
            console.error('Error executing topmaroc command:', error);
            await message.reply('❌ An error occurred while fetching the top servers.');
        }
    },
};
/*
 * Copyright (c) 2025 zotopx
 * 
 * This file is part of conanbot-api, licensed under the MIT License.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
 */