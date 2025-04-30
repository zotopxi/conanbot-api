const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'checkroles',
    description: 'Check user roles across servers',
    aliases: ['cr', 'checkrole'],
    guildOnly: false,
    usage: '<@user|userID>',

    /*
 * @project    conanbot
 * @author     zotopx
 * @license    MIT
 * @copyright  Copyright (c) 2025 zotopx
 * @repo       https://github.com/zotopxi/conanbot-api
 */
    async execute(message, args) {
        const conanuser = message.mentions.users.first() || 
                         (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
        
        if (!conanuser) {
            return message.reply('Please mention a user or provide a valid user ID.');
        }

        

        try {
            const response = await fetch(`https://conanbot.com/api/check-roles/${conanuser.id}`);
            const data = await response.json();

            if (!data.success) {
                return message.reply('❌ Failed to fetch role information.');
            }



            if (!data.results || data.results.length === 0) {
                return message.channel.send({
                    content: '-# <https://conanbot.com/checkrole>',
                    embeds: [
                        new EmbedBuilder()
                            .setThumbnail(conanuser.displayAvatarURL())
                            .setDescription(`**${conanuser.tag}** \`(${conanuser.id})\``)
                            .addFields({
                                name: '**No Roles Found**',
                                value: '```diff\n- User has no special roles in any shared servers\n```',
                                inline: false
                            })
                            .setColor('#ff5555')
                    ]
                });
            }

            for (const guild of data.results) {
                const rolesMessage = guild.roles.map(role => 
                    `${role.name || 'Unknown'} | ID: ${role.id}`
                ).join('\n- ');

                const conancheckrole = new EmbedBuilder()
                    .setAuthor({
                        name: `Check User Roles for: ${conanuser.username}`,
                        iconURL: conanuser.displayAvatarURL()
                    })
                    .setThumbnail(guild.guildIcon || 'https://conanbot.com/media/conanceoo.png')
                    .setDescription(`**${conanuser.tag}** \`(${conanuser.id})\``)
                    .addFields(
                        { 
                            name: '**Server**', 
                            value: `\`\`\`yaml\n${guild.guildName} (${guild.guildId})\`\`\``, 
                            inline: false 
                        },
                        { 
                            name: '**Roles**', 
                            value: `\`\`\`diff\n- ${rolesMessage}\`\`\``, 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'ConanBot Role Check • https://conanbot.com' });
                await message.channel.send({
                    content: '-# <https://conanbot.com/checkrole>',
                    embeds: [conancheckrole]
                });
            }

        } catch (error) {
            console.error('Command Error:', error);
            await loadingMsg.edit('❌ Error checking roles.').catch(() => {});
            await message.channel.send({
                content: '-# <https://conanbot.com/checkrole>',
                embeds: [
                    new EmbedBuilder()
                        .setThumbnail(conanuser.displayAvatarURL())
                        .setTitle('Error Checking Roles')
                        .setDescription('```diff\n- An error occurred while checking roles\n```')
                        .setColor('#ff0000')
                ]
            });
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