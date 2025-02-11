//Import Hyperledger Fabric 1.4 programming model - fabric-network
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;
// let userName = config.userName;
let gatewayDiscovery = config.gatewayDiscovery;
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);


const util = require('util');

exports.connectToNetwork = async function (userName) {

	const gateway = new Gateway();

	try {
		const walletPath = path.join(process.cwd(), 'wallet');
		const wallet = new FileSystemWallet(walletPath);
		const userExists = await wallet.exists(userName);
		if (!userExists) {
			console.log('An identity for the user ' + userName + ' does not exist in the wallet');
			console.log('Run the registerUser.js application before retrying');
			let response = {};
			response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
			return response;
		}

		// console.log('before gateway.connect: ');

		await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

		// Connect to our local fabric
		const network = await gateway.getNetwork('mychannel');

		console.log('Connected to mychannel. ');
		// Get the contract we have installed on the peer
		const contract = await network.getContract('lcu_cc');


		let networkObj = {
			contract: contract,
			network: network,
			gateway: gateway
		};

		return networkObj;

	} catch (error) {
		console.log(`Error processing transaction. ${error}`);
		console.log(error.stack);
		let response = {};
		response.error = error;
		return response;
	}
};

// exports.registerVoter = async function (voterId, registrarId, firstName, lastName) {

//   console.log('registrarId');
//   console.log(registrarId);

//   console.log('voterId ');
//   console.log(voterId);

//   if (!registrarId || !voterId || !firstName || !lastName) {
//     let response = {};
//     response.error = 'Error! You need to fill all fields before you can register!';
//     return response;
//   }

//   try {

//     // Create a new file system based wallet for managing identities.
//     const walletPath = path.join(process.cwd(), 'wallet');
//     const wallet = new FileSystemWallet(walletPath);
//     console.log(`Wallet path: ${walletPath}`);
//     console.log(wallet);

//     // Check to see if we've already enrolled the user.
//     const userExists = await wallet.exists(voterId);
//     if (userExists) {
//       let response = {};
//       console.log(`An identity for the user ${voterId} already exists in the wallet`);
//       response.error = `Error! An identity for the user ${voterId} already exists in the wallet. Please enter
//         a different license number.`;
//       return response;
//     }

//     // Check to see if we've already enrolled the admin user.
//     const adminExists = await wallet.exists(appAdmin);
//     if (!adminExists) {
//       console.log(`An identity for the admin user ${appAdmin} does not exist in the wallet`);
//       console.log('Run the enrollAdmin.js application before retrying');
//       let response = {};
//       response.error = `An identity for the admin user ${appAdmin} does not exist in the wallet. 
//         Run the enrollAdmin.js application before retrying`;
//       return response;
//     }

//     // Create a new gateway for connecting to our peer node.
//     const gateway = new Gateway();
//     await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

//     // Get the CA client object from the gateway for interacting with the CA.
//     const ca = gateway.getClient().getCertificateAuthority();
//     const adminIdentity = gateway.getCurrentIdentity();
//     console.log(`AdminIdentity: + ${adminIdentity}`);

//     // Register the user, enroll the user, and import the new identity into the wallet.
//     const secret = await ca.register({ affiliation: 'org1', enrollmentID: voterId, role: 'client' }, adminIdentity);

//     const enrollment = await ca.enroll({ enrollmentID: voterId, enrollmentSecret: secret });
//     const userIdentity = await X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
//     await wallet.import(voterId, userIdentity);
//     console.log(`Successfully registered voter ${firstName} ${lastName}. Use voterId ${voterId} to login above.`);
//     let response = `Successfully registered voter ${firstName} ${lastName}. Use voterId ${voterId} to login above.`;
//     return response;
//   } catch (error) {
//     console.error(`Failed to register user + ${voterId} + : ${error}`);
//     let response = {};
//     response.error = error;
//     return response;
//   }
// };
