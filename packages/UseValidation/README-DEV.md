### Building and publishing steps
- For each commit run `pnpm changeset` to add changeset file which indicates the change as major, minor or patch. Also commit the changeset file.
- When ready to publish run `pnpm changeset version` this will bump the version for changed packages and packages dependent on the changed packages. This will also delete the changeset files. Commit the changes before publishing the project.
- Currently we are only publishing `@devnepal/use-form` package so run script scoped to that package only `pnpm --filter @devnepal/use-form ci:publish`. This will build and publish the package.
- If you want to publish multiple packages do `pnpm ci:publish-all`
