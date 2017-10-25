"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prm = require("es6-promise");
const storage = require("electron-json-storage");
const burst_1 = require("../burst/burst");
const servers_1 = require("../burst/servers");
const Promise = prm.Promise;
class ServersComponents {
    constructor() {
        this.firstCall = true;
        this.storageKey = 'wallet-server';
        this.currentWallet = '';
        burst_1.burstApiConfig.wallets = burst_1.defaultWallets;
        storage.get(this.storageKey, (err, data) => {
            if (err || !data.length)
                return;
            this.setWallet(data);
        });
    }
    /**
     * Called when App.init() is called.
     * @returns {Promise}
     */
    init() {
        console.log('Initializing ServersComponents...');
        this.initjQuery();
        this.events();
        this.$inputServerUrl.val(this.currentWallet);
        return this.getBlockInfo();
    }
    getBlockInfo() {
        return new Promise((resolve, reject) => {
            servers_1.serversApi.getBlockchainStatus().then((status) => {
                this.$server.text(burst_1.burstApiConfig.currentWallet.replace(/(^\w+:|^)\/\//, '').split(':')[0]);
                this.$height.text(status.lastBlockchainFeederHeight);
                if (this.firstCall) {
                    this.$connecting.hide();
                    this.$connected.show();
                    this.firstCall = false;
                }
                resolve();
            }).catch(e => {
                console.log(e);
                this.$server.text('Unable to connect to server...');
                this.$height.text('');
                if (this.firstCall) {
                    this.$connecting.hide();
                    this.$connected.show();
                    this.firstCall = false;
                }
                reject(e);
            });
        });
    }
    initjQuery() {
        this.$connecting = $('.js-wallet-connecting');
        this.$connected = $('.js-wallet-details');
        this.$server = $('.js-connected-server');
        this.$height = $('.js-block-height');
        this.$inputServerUrl = $('.js-server-url');
        this.$btnSaveServer = $('.js-save-server');
        this.$modalEditServer = $('#editServerModal');
    }
    setWallet(walletArr) {
        burst_1.burstApiConfig.wallets = walletArr;
        burst_1.burstApiConfig.currentWalletIndex = 0;
        burst_1.burstApiConfig.currentWallet = walletArr[0];
        this.currentWallet = walletArr[0];
        this.$inputServerUrl.val(this.currentWallet);
        this.getBlockInfo().catch(e => { console.log(e); });
    }
    saveWallet(walletArr) {
        storage.set(this.storageKey, walletArr);
        this.setWallet(walletArr);
    }
    clearWallets() {
        storage.remove(this.storageKey);
        this.setWallet(burst_1.defaultWallets);
        this.$inputServerUrl.val('');
        this.getBlockInfo().catch(e => { console.log(e); });
    }
    events() {
        this.$btnSaveServer.on('click', e => {
            e.preventDefault();
            let serverURI = $.trim(this.$inputServerUrl.val());
            if (this.$inputServerUrl.hasClass('invalid')) {
                return alert('Incorrect wallet server.');
            }
            if (!serverURI.length) {
                this.clearWallets();
            }
            else {
                serverURI = serverURI.split('/index.html')[0];
                if (serverURI.indexOf('/burst') === -1) {
                    serverURI += '/burst';
                }
                this.saveWallet([serverURI]);
            }
            this.$modalEditServer.modal('close');
        });
    }
}
exports.serversComponents = new ServersComponents();