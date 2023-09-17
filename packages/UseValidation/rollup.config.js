import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import json from 'rollup-plugin-json'
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy'

// const packageJson = require('./package.json');
import packageJson from './package.json' assert {
    type: 'json',
};
export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
                name: 'react-lib'
            },
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true
            },
        ],
        plugins: [
            external(),
            resolve(),
            commonjs(),
            json(),
            typescript({ tsconfig: './tsconfig.json' }),
            postcss(),
            terser(),
            copy({
                targets: [
                  { src: ['README.md', 'package.json'], dest: 'dist/' },
                ]
            }),

        ]
    },
    // {
    //     input: 'dist/esm/types/index.d.ts',
    //     output: [{ file: 'dist/index.d.ts', format: "esm" }],
    //     external: [/\.css$/],
    //     plugins: [dts()],
    // },
]
