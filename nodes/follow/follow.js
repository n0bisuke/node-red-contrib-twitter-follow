module.exports = (RED) => {
    'use strict';

    const twitter = require('twitter');

    const main = function(config){
        const node = this;
        RED.nodes.createNode(node, config);
        let twitterconfig;
        try {
            twitterconfig = require('../../env');
        } catch (error) {
            twitterconfig = { 
                consumer_key: config.consumer_key,
                consumer_secret: config.consumer_secret,
                access_token_key: config.access_token_key,
                access_token_secret: config.access_token_secret
            };
        }
        
        let client = {};
        try {
            client = new twitter(twitterconfig);
        } catch (error) {
            console.log(error);
        }

        node.on('input', async (msg) => {
            const mes = msg.payload;
            try {
                if(!msg.tweet) throw new Error('Tweetオブジェクトがありません。');

                console.log(`[${msg.tweet.user.id_str}]${msg.tweet.user.name}さんをフォローしようとしています。`);
                await client.post('friendships/create', {user_id: msg.tweet.user.id});
                console.log(`${msg.tweet.user.name}さんをフォローしました。`);            
            } catch (error) {
                console.log(error);
            }
            msg.payload = res.data;
            node.send(msg);
        });

    }

    RED.nodes.registerType("Notify", main);
}