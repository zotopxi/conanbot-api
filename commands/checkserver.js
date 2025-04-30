const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'checkserver',
    description: 'Check server members with admin roles from API',
    aliases: ['cs', 'checkserver'],
     /*
 * @project    conanbot
 * @author     zotopx
 * @license    MIT
 * @copyright  Copyright (c) 2025 zotopx
 * @repo       https://github.com/zotopxi/conanbot-api
 */
    async execute(message, args) {
        const conanserver = args[0];
        if (!conanserver) return message.reply('Please provide a server ID');
        try {
            const response = await fetch(`https://conanbot.com/api/check-server/${conanserver}`);
            const data = await response.json();
            if (!data.success) {
                return message.reply(`❌ ${data.error || 'API request failed'}`);
            }
           
            const currentServerMembers = message.guild?.members.cache;

            const chunks = [];
            for (let i = 0; i < data.adminMembers.length; i += 10) {
                chunks.push(data.adminMembers.slice(i, i + 10));
            }

            let currentPage = 0;

            const createEmbed = (page) => {
                const membersList = chunks[page].map(member => {
                    const inserver = currentServerMembers?.has(member.id) ? '(Are In Server)' : '';
                    return ` <@${member.id}> \`${member.displayName}\` \`${member.id}\` **${inserver}** \n` +
                           `Role: \`${member.roles[0]?.name || 'No role'}\`\n`;
                }).join('\n');

                return new EmbedBuilder()
                    .setAuthor({
                        name: 'Check Server',
                        iconURL: data.server.icon,
                        url: 'https://discord.gg/6MDdb3eCgw'
                    })
                    .setDescription(`**Members with admin roles in ${data.server.name}**\n${membersList}`)
                    .setFooter({
                        text: `Page ${page + 1}/${chunks.length} | ${data.server.name}`,
                        iconURL: data.server.icon
                    })
                    .setThumbnail(data.server.icon)
                    .setColor('#FF9900');
            };
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous_page')
                        .setLabel('Previous')
                        .setStyle('Secondary')
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Next')
                        .setStyle('Secondary')
                        .setDisabled(currentPage === chunks.length - 1)
                );
            const reply = await message.channel.send({
                content: '-# https://conanbot.com/checkserver',
                embeds: [createEmbed(currentPage)],
                components: [row],
                allowedMentions: { repliedUser: false }
            });
            const filter = i => i.user.id === message.author.id;
            const collector = reply.createMessageComponentCollector({ filter, time: 60000 });
            collector.on('collect', async interaction => {
                if (interaction.customId === 'previous_page' && currentPage > 0) {
                    currentPage--;
                } else if (interaction.customId === 'next_page' && currentPage < chunks.length - 1) {
                    currentPage++;
                }
                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled(currentPage === chunks.length - 1);

                await interaction.update({
                    content: '-# https://conanbot.com/checkserver',
                    embeds: [createEmbed(currentPage)],
                    components: [row]
                });
            });

            collector.on('end', () => {
                reply.edit({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error(error);
          
        }
    }
};

/*
 * Copyright (c) 2025 zotopx
 * 
 * This file is part of conanbot-api, licensed under the MIT License.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
 */