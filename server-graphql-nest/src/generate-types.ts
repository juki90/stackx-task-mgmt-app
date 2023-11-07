import * as path from 'path';

import { GraphQLDefinitionsFactory } from '@nestjs/graphql';

const definitionsFactory = new GraphQLDefinitionsFactory();

definitionsFactory.generate({
    typePaths: ['./**/*.graphql'],
    path: path.join(process.cwd(), 'src/graphql.ts'),
    outputAs: 'class',
    watch: true,
    skipResolverArgs: true
});
