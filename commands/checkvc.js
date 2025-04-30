const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
module.exports = {
    name: 'checkvc',
    description: 'Check which voice channels a user is in across servers',
    aliases: ['voicecheck', 'vcstatus'],
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
            return message.reply('Please mention a user or provide a user ID to check.');
        }

     

        try {
            const response = await fetch(`https://conanbot.com/api/check-user-voice/${conanuser.id}`);
            const data = await response.json();

            if (!data.success) {
                return message.reply(`❌ ${data.error || 'Failed to fetch voice data'}`);
            }
            if (!data.voiceStatus || data.voiceStatus.length === 0) {
                return message.channel.send({
                    content: '-# https://conanbot.com/checkvc',
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: `${conanuser.tag} is not in any voice channels`,
                                iconURL: conanuser.displayAvatarURL()
                            })
                            .setColor('#ff5555')
                    ]
                });
            }
            const conanvoicemap = new Map();
            data.voiceStatus.forEach(vc => {
                conanvoicemap.set(vc.guildId, {
                    voice: {
                        channel: {
                            id: vc.channelId,
                            name: vc.channelName,
                            members: new Map(vc.channelMembers.map(m => [m.id, m]))
                        },
                        mute: vc.muted,
                        selfMute: vc.muted,
                        deaf: vc.deafened,
                        selfDeaf: vc.deafened,
                        streaming: vc.streaming,
                        video: vc.video
                    },
                    guild: {
                        id: vc.guildId,
                        name: vc.guildName,
                        iconURL: () => vc.guildIcon,
                        memberCount: vc.channelMembers.length + 1
                    },
                    user: {
                        id: conanuser.id,
                        username: conanuser.username,
                        tag: conanuser.tag,
                        avatarURL: () => conanuser.displayAvatarURL(),
                        displayAvatarURL: () => conanuser.displayAvatarURL()
                    }
                });
            });

            const serverIds = Array.from(conanvoicemap.keys());
            let serverIndex = 0;

            const showVoiceInfo = async (guildId, sentMessage) => {
                const conanwithvoice = conanvoicemap.get(guildId);
                const voiceChannel = conanwithvoice.voice.channel;
                const voiceMembers = voiceChannel.members;

                const getconanuser = (member) => {
                    let userInfo = `<@${member.id}>`;
                    if (member.voice?.selfMute) userInfo += "(SelfMuted)";
                    if (member.voice?.serverMute) userInfo += "(Muted By Someone)";
                    if (member.voice?.selfDeaf) userInfo += "(SelfDeafen)";
                    if (member.voice?.serverDeaf) userInfo += "(Deafen By Someone)";
                    if (member.voice?.video) userInfo += "📷";
                    return userInfo;
                };

                const conanmentioned = [`${getconanuser({
                    id: conanuser.id,
                    voice: conanwithvoice.voice
                })}`];
                
                Array.from(voiceMembers.values())
                    .filter(member => member.id !== conanuser.id)
                    .forEach(member => conanmentioned.push(getconanuser(member)));
                let conanuserinvoice = conanmentioned.length > 0 ? conanmentioned.join('\n') : 'No one';
                if (conanmentioned.length > 10) {
                    conanuserinvoice = conanmentioned.slice(0, 10).join('\n') + '\n...Too many users';
                }
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setLabel('Join Voice Channel').setStyle('Link').setURL(`https://discord.com/channels/${guildId}/${voiceChannel.id}`)
                    );

                if (serverIds.length > 1) {
                    row.addComponents(
                        new ButtonBuilder().setLabel('Next Server').setStyle('Secondary').setCustomId('nextServer')
                    );
                }

                const embed = new EmbedBuilder()
                    .setAuthor({ 
                        name: `${message.client.user.username}`, 
                        iconURL: message.client.user.displayAvatarURL({ dynamic: true }), 
                        url: 'https://discord.gg/6MDdb3eCgw' 
                    })
                    .setColor('#4dff4d') // Using your color scheme
                    .setTimestamp()
                    .setThumbnail(conanwithvoice.guild.iconURL())
                    .setFooter({ 
                        text: conanuser.tag, 
                        iconURL: conanuser.displayAvatarURL() 
                    })
                    .addFields(
                        { name: 'Server:', value: `${conanwithvoice.guild.name}/\`${conanwithvoice.guild.id}\``, inline: true },
                        { name: 'Server Member Count:', value: `${conanwithvoice.guild.memberCount}`, inline: true },
                        { name: 'Voice channel name:', value: `${voiceChannel.name}`, inline: true },
                        { name: 'Users In same voice with user:', value: `${conanuserinvoice}`, inline: false },
                    );

                if (sentMessage) {
                    await sentMessage.edit({
                        content: "-# https://conanbot.com/checkvc",
                        embeds: [embed], 
                        components: [row] 
                    });
                } else {
                    const newSentMessage = await message.reply({
                        content: "-# https://conanbot.com/checkvc",
                        embeds: [embed],
                        components: [row],
                        allowedMentions: { repliedUser: false }
                    });
                    return newSentMessage;
                }
            };

            let sentMessage = await showVoiceInfo(serverIds[serverIndex]);
            const filter = (interaction) => interaction.isButton() && interaction.message.id === sentMessage.id;
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'nextServer') {
                    serverIndex = (serverIndex + 1) % serverIds.length;
                    await showVoiceInfo(serverIds[serverIndex], sentMessage);
                    await interaction.deferUpdate();
                }
            });

            collector.on('end', () => {
                sentMessage.edit({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error('Error in checkvc command:', error);
         
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