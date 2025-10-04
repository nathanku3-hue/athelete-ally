import { glob, readYAML, writeYAMLSorted, headerWithSources } from './lib/fs';

async function build() {
  const sources = await glob(['openapi/paths/**/*.y?(a)ml', 'openapi/components/**/*.y?(a)ml']);

  // Compose
  const openapi: any = {
    openapi: '3.1.0',
    info: { title: 'Service API', version: '0.1.0' },
    paths: {},
    components: {},
    'x-generated': true,
  };

  for (const p of sources.sort()) {
    const y: any = await readYAML(p);
    // Merge paths
    for (const [k, v] of Object.entries(y || {})) {
      if (
        k === 'x-id' ||
        k === 'schemas' ||
        k === 'parameters' ||
        k === 'responses' ||
        k === 'headers' ||
        k === 'securitySchemes' ||
        k === 'requestBodies' ||
        k === 'examples' ||
        k === 'links' ||
        k === 'callbacks' ||
        k === 'path' ||
        k === 'pathItem'
      ) {
        // handled below or special cases
        continue;
      }
    }
    if (
      y?.schemas ||
      y?.parameters ||
      y?.responses ||
      y?.headers ||
      y?.securitySchemes ||
      y?.requestBodies ||
      y?.examples ||
      y?.links ||
      y?.callbacks
    ) {
      openapi.components = { ...openapi.components, ...y };
      delete openapi.components['x-id'];
    } else {
      // treat as a path fragment: if it contains root keys like '/foo'
      for (const [route, item] of Object.entries(y || {})) {
        if (!route.startsWith('/')) continue;
        openapi.paths[route] = { ...(openapi.paths[route] || {}), ...(item as any) };
      }
    }
  }

  // Header + write
  const header = headerWithSources('OpenAPI (openapi.yaml)', sources);
  const final: any = { ...openapi };
  // Attach header as YAML comments via string prefix
  const target = 'openapi.yaml';
  await writeYAMLSorted(target, final);
  // Prepend header (js-yaml lacks comment support). Re-write with header.
  const fs = await import('node:fs/promises');
  const body = await fs.readFile(target, 'utf8');
  await fs.writeFile(target, header + body, 'utf8');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
