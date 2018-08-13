import vscode = require('vscode');
import { reporter } from '../../telemetry/telemetry';
const teleCmdId: string = 'vscode-docker.image.pullFromAzure';
import { AzureImageNode } from '../../explorer/models/AzureRegistryNodes';
import * as acrTools from '../../utils/Azure/acrTools';

/* Pulls an image from Azure. The context is the image node the user has right clicked on */
export async function pullFromAzure(context?: AzureImageNode): Promise<any> {

    // Step 1: Using loginCredentials() function to get the username and password. This takes care of all users, even if they don't have the Azure CLI
    let credentials;
    try {
        credentials = await acrTools.loginCredentialsRefreshToken(context.subscription, context.registry, context);
    } catch (error) {
        console.log(error);
    }
    let username = credentials.username;
    let password = credentials.password;
    let registry = context.registry.loginServer;

    const terminal = vscode.window.createTerminal("Docker");
    terminal.show();

    // Step 2: docker login command
    terminal.sendText(`docker login ${registry} -u ${username} -p ${password}`);

    // Step 3: docker pull command
    console.log(context.repository);
    terminal.sendText(`docker pull ${registry}/${context.label}`);

    //Acquiring telemetry data here
    if (reporter) {
        reporter.sendTelemetryEvent('command', {
            command: teleCmdId
        });
    }

}
