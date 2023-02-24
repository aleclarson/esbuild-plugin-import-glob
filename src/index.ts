import { useRna, Build } from 'esbuild-rna';
import { TransformConfig, transformGlob } from './transformGlob';
import type { Plugin } from 'esbuild';

export type PluginOptions = {
	jsFileRe: RegExp;
	jsxFileRe: RegExp;
	tsFileRe: RegExp;
	tsxFileRe: RegExp;
};

const defaultPluginOptions: PluginOptions = {
	tsFileRe: /\.ts$/,
	tsxFileRe: /\.tsx$/,
	jsFileRe: /\.js$/,
	jsxFileRe: /\.jsx$/,
};

const addGlobTransformer = (build: Build, filter: RegExp, config: Omit<TransformConfig, 'path'>) => {
	build.onTransform({ filter }, async (parameters) => {
		return transformGlob(parameters.code, {
			...config,
			path: parameters.path,
		});
	});
};

const createPlugin = (options?: Partial<PluginOptions>) => {
	const { jsFileRe, jsxFileRe, tsFileRe, tsxFileRe } = Object.assign(options ?? {}, defaultPluginOptions);
	const plugin: Plugin = {
		name: 'esbuild-plugin-import-glob',
		setup(build) {
			const rna = useRna(plugin, build);
			addGlobTransformer(rna, jsFileRe, { ts: false, jsx: false });
			addGlobTransformer(rna, jsxFileRe, { ts: false, jsx: true });
			addGlobTransformer(rna, tsFileRe, { ts: true, jsx: false });
			addGlobTransformer(rna, tsxFileRe, { ts: true, jsx: true });
		},
	};
	return plugin;
};

export default createPlugin;
