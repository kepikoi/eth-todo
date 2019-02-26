module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 7545, // equals the RPC SERVER value of HTTP://127.0.0.1:7545 in Ganache
            network_id: "*"
        }
    }
};
