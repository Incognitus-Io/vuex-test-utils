import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';
import configs from './config';

const externals = [
    'vuex',
    'chai',
    'chai-as-promised',
];

const genTsPlugin = (configOpts) => typescript({
    typescript: ttypescript,
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
        compilerOptions: {
            target: configOpts.target,
            module: configOpts.module,
            declaration: configOpts.genDts,
        },
    },
});

const genPlugins = (configOpts) => {
    const plugins = [];
    if (configOpts.env) {
        plugins.push(replace({
            'process.env.NODE_ENV': JSON.stringify(configOpts.env),
        }));
    }
    plugins.push(replace({
        'process.env.MODULE_FORMAT': JSON.stringify(configOpts.format),
    }));
    if (configOpts.plugins && configOpts.plugins.pre) {
        plugins.push(...configOpts.plugins.pre);
    }
    plugins.push(genTsPlugin(configOpts));

    if (configOpts.plugins && configOpts.plugins.post) {
        plugins.push(...configOpts.plugins.post);
    }
    return plugins;
}

const genConfig = (configOpts) => ({
    input: 'src/index.ts',
    output: {
        file: configOpts.output,
        format: configOpts.format,
        name: 'VuexTestUtils',
        sourcemap: true,
        exports: 'named',
        globals: configOpts.globals,
    },
    external: externals,
    plugins: genPlugins(configOpts),
});

const genAllConfigs = (configs) => (Object.keys(configs).map(key => genConfig(configs[key])));

export default genAllConfigs(configs);
