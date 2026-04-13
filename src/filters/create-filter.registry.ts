import { FilterRegistry } from './filter.registry.js';
import { PublicStartFilter } from './public-start.filter.js';
import { SinkEndFilter } from './sink-end.filter.js';
import { VulnerabilityFilter } from './vulnerability.filter.js';

export function createFilterRegistry(): FilterRegistry {
  const registry = new FilterRegistry();
  registry.register(new PublicStartFilter());
  registry.register(new SinkEndFilter());
  registry.register(new VulnerabilityFilter());
  return registry;
}
