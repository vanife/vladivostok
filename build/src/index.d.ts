export { Router } from './router';
export { UrlSerializer, DefaultUrlSerializer } from './url_serializer';
export { RouterState, ActivatedRoute } from './router_state';
export { UrlTree, UrlSegment } from './url_tree';
export { RouterOutletMap } from './router_outlet_map';
export { RouterConfig, Route } from './config';
export { Params, PRIMARY_OUTLET } from './shared';
export { provideRouter } from './router_providers';
import { RouterOutlet } from './directives/router_outlet';
import { RouterLink } from './directives/router_link';
export declare const ROUTER_DIRECTIVES: (typeof RouterOutlet | typeof RouterLink)[];
