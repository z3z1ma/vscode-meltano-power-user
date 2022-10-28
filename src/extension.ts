import 'reflect-metadata';
import * as vscode from 'vscode';

import { MeltanoPowerUserExtension } from './meltanoPowerUserExtension';

import container from './inversify.config';

export async function activate(context: vscode.ExtensionContext) {
	const meltanoPowerUserExtension = container.get(MeltanoPowerUserExtension);
	context.subscriptions.push(
		meltanoPowerUserExtension,
	);
	await meltanoPowerUserExtension.activate(context);
}

export function deactivate() {}
