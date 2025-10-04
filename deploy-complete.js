#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const DEPLOY_HOST = process.env.DEPLOY_HOST || 'ders.ba';
const DEPLOY_USER = process.env.DEPLOY_USER || 'root';
const DEPLOY_PORT = process.env.DEPLOY_PORT || '22';
const DEPLOY_PATH = process.env.DEPLOY_PATH || '/var/www/ders.ba';

const args = process.argv.slice(2);
const deployType = args[0] || 'deploy';

function exec(command, options = {}) {
    console.log(`Executing: ${command}`);
    try {
        // Add SSHPASS environment variable for password authentication
        const env = { ...process.env, SSHPASS: 'WanNeAvdo1994' };
        execSync(command, { stdio: 'inherit', env, ...options });
        return true;
    } catch (error) {
        console.error(`Error executing: ${command}`);
        console.error(error.message);
        return false;
    }
}

function deployWeb() {
    console.log('\n📦 Building web application...');
    if (!exec('cd packages/web && npm run build')) {
        throw new Error('Web build failed');
    }

    console.log('\n🚀 Deploying web to server...');
    // Deploy the entire web directory including .next for SSR
    if (!exec(`sshpass -e rsync -avz --exclude 'node_modules' --exclude '.env.local' -e "ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no" packages/web/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/web/`)) {
        throw new Error('Web deployment failed');
    }

    console.log('\n📦 Installing web dependencies on server...');
    if (!exec(`sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/web && npm install --production --legacy-peer-deps"`)) {
        throw new Error('Web dependency installation failed');
    }

    console.log('\n🔄 Restarting web application...');
    if (!exec(`sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/web && (pm2 restart ders-web --update-env || (PORT=3002 pm2 start npm --name ders-web -- start))"`)) {
        throw new Error('Web restart failed');
    }

    console.log('✅ Web deployment complete');
}

function deployServer() {
    console.log('\n📦 Preparing server files...');
    
    console.log('\n🚀 Deploying server to production...');
    if (!exec(`sshpass -e rsync -avz --exclude 'node_modules' --exclude '.env' -e "ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no" server/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/server/`)) {
        throw new Error('Server deployment failed');
    }

    console.log('\n📦 Installing server dependencies...');
    if (!exec(`sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/server && npm install --production --legacy-peer-deps"`)) {
        throw new Error('Server dependency installation failed');
    }

    console.log('\n🔄 Restarting server...');
    if (!exec(`sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/server && pm2 restart ders-server || pm2 start server.js --name ders-server"`)) {
        throw new Error('Server restart failed');
    }

    console.log('✅ Server deployment complete');
}

function checkHealth() {
    console.log('\n🏥 Checking deployment health...');
    
    // Check web
    exec(`curl -s -o /dev/null -w "%{http_code}" https://ders.ba`);
    
    // Check API
    exec(`curl -s -o /dev/null -w "%{http_code}" https://ders.ba/api/health`);
    
    console.log('✅ Health check complete');
}

function createBackup() {
    console.log('\n💾 Creating backup...');
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    exec(`sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "mongodump --db Predavanja --out /backups/db-${timestamp}"`);
    exec(`sshpass -e ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "tar -czf /backups/files-${timestamp}.tar.gz ${DEPLOY_PATH}"`);
    
    console.log('✅ Backup complete');
}

async function main() {
    try {
        console.log('🚀 Starting deployment process...');
        console.log(`Deploy type: ${deployType}`);
        console.log(`Target: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PORT}`);
        
        switch(deployType) {
            case 'web':
                deployWeb();
                break;
            case 'server':
                deployServer();
                break;
            case 'full':
            case 'deploy':
                deployServer();
                deployWeb();
                break;
            case 'health':
                checkHealth();
                break;
            case 'backup':
                createBackup();
                break;
            default:
                console.error(`Unknown deploy type: ${deployType}`);
                console.log('Available options: deploy, web, server, full, health, backup');
                process.exit(1);
        }
        
        console.log('\n✅ Deployment completed successfully!');
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main();
