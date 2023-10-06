export default {
    verbose: true,
    testRegex: ['src/.*\\.test\\.[jt]sx?$'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/resources/__jest_loader_mocks__/fileMock.js',
        '\\.module\\.css$': 'identity-obj-proxy',
        '\\.module\\.scss$': 'identity-obj-proxy',
        '\\.mdx$': '<rootDir>/resources/__jest_loader_mocks__/fileMock.js',
        '^.+\\.(css|less|scss)$': '<rootDir>/resources/__jest_loader_mocks__/styleMock.js',
        '^.+\\.svg$': '<rootDir>/resources/__jest_loader_mocks__/svgMock.js',
    },
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    // setupFiles: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['jest-expect-message'],
    transformIgnorePatterns: [
        'node_modules/(?!((ol)|(ol-mapbox-style))/)', // <- exclude the OL lib
    ],
    collectCoverageFrom: [
        'src/Components/**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
    ],
    coveragePathIgnorePatterns: ['\\.stories\\.[jt]sx?$', '.*\\.d\\.ts$'],
    coverageDirectory: 'dist/fe-coverage',
    coverageReporters: ['lcov', 'text-summary'],
    coverageThreshold: {
        'src/**/*.{js,jsx,ts,tsx}': {
            branches: 0,
        },
    },
    reporters: ['default', 'jest-junit'],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
};
