import { UrlTree, UrlSegment } from './url_tree';
import { PRIMARY_OUTLET } from './shared';
import { rootNode, TreeNode } from './utils/tree';
export class UrlSerializer {
}
export class DefaultUrlSerializer {
    parse(url) {
        const p = new UrlParser(url);
        return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
    }
    serialize(tree) {
        const node = serializeUrlTreeNode(rootNode(tree));
        const query = serializeQueryParams(tree.queryParameters);
        const fragment = tree.fragment !== null ? `#${tree.fragment}` : '';
        return `${node}${query}${fragment}`;
    }
}
function serializeUrlTreeNode(node) {
    return `${serializeSegment(node.value)}${serializeChildren(node)}`;
}
function serializeUrlTreeNodes(nodes) {
    const primary = serializeSegment(nodes[0].value);
    const secondaryNodes = nodes.slice(1);
    const secondary = secondaryNodes.length > 0 ? `(${secondaryNodes.map(serializeUrlTreeNode).join("//")})` : "";
    const children = serializeChildren(nodes[0]);
    return `${primary}${secondary}${children}`;
}
function serializeChildren(node) {
    if (node.children.length > 0) {
        return `/${serializeUrlTreeNodes(node.children)}`;
    }
    else {
        return "";
    }
}
export function serializeSegment(segment) {
    const outlet = segment.outlet === PRIMARY_OUTLET ? '' : `${segment.outlet}:`;
    return `${outlet}${segment.path}${serializeParams(segment.parameters)}`;
}
function serializeParams(params) {
    return pairs(params).map(p => `;${p.first}=${p.second}`).join("");
}
function serializeQueryParams(params) {
    const strs = pairs(params).map(p => `${p.first}=${p.second}`);
    return strs.length > 0 ? `?${strs.join("&")}` : "";
}
class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}
function pairs(obj) {
    const res = [];
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            res.push(new Pair(prop, obj[prop]));
        }
    }
    return res;
}
const SEGMENT_RE = /^[^\/\(\)\?;=&#]+/;
function matchUrlSegment(str) {
    SEGMENT_RE.lastIndex = 0;
    var match = SEGMENT_RE.exec(str);
    return match ? match[0] : '';
}
const QUERY_PARAM_VALUE_RE = /^[^\(\)\?;&#]+/;
function matchUrlQueryParamValue(str) {
    QUERY_PARAM_VALUE_RE.lastIndex = 0;
    const match = QUERY_PARAM_VALUE_RE.exec(str);
    return match ? match[0] : '';
}
class UrlParser {
    constructor(remaining) {
        this.remaining = remaining;
    }
    peekStartsWith(str) { return this.remaining.startsWith(str); }
    capture(str) {
        if (!this.remaining.startsWith(str)) {
            throw new Error(`Expected "${str}".`);
        }
        this.remaining = this.remaining.substring(str.length);
    }
    parseRootSegment() {
        if (this.remaining == '' || this.remaining == '/') {
            return new TreeNode(new UrlSegment('', {}, PRIMARY_OUTLET), []);
        }
        else {
            const segments = this.parseSegments(false);
            return new TreeNode(new UrlSegment('', {}, PRIMARY_OUTLET), segments);
        }
    }
    parseSegments(hasOutletName) {
        if (this.remaining.length == 0) {
            return [];
        }
        if (this.peekStartsWith('/')) {
            this.capture('/');
        }
        let path = matchUrlSegment(this.remaining);
        this.capture(path);
        let outletName;
        if (hasOutletName) {
            if (path.indexOf(":") === -1) {
                throw new Error("Not outlet name is provided");
            }
            if (path.indexOf(":") > -1 && hasOutletName) {
                let parts = path.split(":");
                outletName = parts[0];
                path = parts[1];
            }
        }
        else {
            if (path.indexOf(":") > -1) {
                throw new Error("Not outlet name is allowed");
            }
            outletName = PRIMARY_OUTLET;
        }
        let matrixParams = {};
        if (this.peekStartsWith(';')) {
            matrixParams = this.parseMatrixParams();
        }
        let secondary = [];
        if (this.peekStartsWith('(')) {
            secondary = this.parseSecondarySegments();
        }
        let children = [];
        if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
            this.capture('/');
            children = this.parseSegments(false);
        }
        const segment = new UrlSegment(path, matrixParams, outletName);
        const node = new TreeNode(segment, children);
        return [node].concat(secondary);
    }
    parseQueryParams() {
        var params = {};
        if (this.peekStartsWith('?')) {
            this.capture('?');
            this.parseQueryParam(params);
            while (this.remaining.length > 0 && this.peekStartsWith('&')) {
                this.capture('&');
                this.parseQueryParam(params);
            }
        }
        return params;
    }
    parseFragment() {
        if (this.peekStartsWith('#')) {
            return this.remaining.substring(1);
        }
        else {
            return null;
        }
    }
    parseMatrixParams() {
        var params = {};
        while (this.remaining.length > 0 && this.peekStartsWith(';')) {
            this.capture(';');
            this.parseParam(params);
        }
        return params;
    }
    parseParam(params) {
        var key = matchUrlSegment(this.remaining);
        if (!key) {
            return;
        }
        this.capture(key);
        var value = "true";
        if (this.peekStartsWith('=')) {
            this.capture('=');
            var valueMatch = matchUrlSegment(this.remaining);
            if (valueMatch) {
                value = valueMatch;
                this.capture(value);
            }
        }
        params[key] = value;
    }
    parseQueryParam(params) {
        var key = matchUrlSegment(this.remaining);
        if (!key) {
            return;
        }
        this.capture(key);
        var value = "true";
        if (this.peekStartsWith('=')) {
            this.capture('=');
            var valueMatch = matchUrlQueryParamValue(this.remaining);
            if (valueMatch) {
                value = valueMatch;
                this.capture(value);
            }
        }
        params[key] = value;
    }
    parseSecondarySegments() {
        var segments = [];
        this.capture('(');
        while (!this.peekStartsWith(')') && this.remaining.length > 0) {
            segments = segments.concat(this.parseSegments(true));
            if (this.peekStartsWith('//')) {
                this.capture('//');
            }
        }
        this.capture(')');
        return segments;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3NlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXJsX3NlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sWUFBWTtPQUN6QyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVU7T0FDbEMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYztBQUtqRDtBQVVBLENBQUM7QUFLRDtJQUNFLEtBQUssQ0FBQyxHQUFXO1FBQ2YsTUFBTSxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBYTtRQUNyQixNQUFNLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRCxNQUFNLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDekQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ25FLE1BQU0sQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7SUFDdEMsQ0FBQztBQUNILENBQUM7QUFFRCw4QkFBOEIsSUFBMEI7SUFDdEQsTUFBTSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDckUsQ0FBQztBQUVELCtCQUErQixLQUE2QjtJ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JztcbmltcG9ydCB7IFBSSU1BUllfT1VUTEVUIH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHsgcm9vdE5vZGUsIFRyZWVOb2RlIH0gZnJvbSAnLi91dGlscy90cmVlJztcblxuLyoqXG4gKiBEZWZpbmVzIGEgd2F5IHRvIHNlcmlhbGl6ZS9kZXNlcmlhbGl6ZSBhIHVybCB0cmVlLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVXJsU2VyaWFsaXplciB7XG4gIC8qKlxuICAgKiBQYXJzZSBhIHVybCBpbnRvIGEge0BMaW5rIFVybFRyZWV9XG4gICAqL1xuICBhYnN0cmFjdCBwYXJzZSh1cmw6IHN0cmluZyk6IFVybFRyZWU7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BMaW5rIFVybFRyZWV9IGludG8gYSB1cmxcbiAgICovXG4gIGFic3RyYWN0IHNlcmlhbGl6ZSh0cmVlOiBVcmxUcmVlKTogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgc2VyaWFsaXphdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRVcmxTZXJpYWxpemVyIGltcGxlbWVudHMgVXJsU2VyaWFsaXplciB7XG4gIHBhcnNlKHVybDogc3RyaW5nKTogVXJsVHJlZSB7XG4gICAgY29uc3QgcCA9IG5ldyBVcmxQYXJzZXIodXJsKTtcbiAgICByZXR1cm4gbmV3IFVybFRyZWUocC5wYXJzZVJvb3RTZWdtZW50KCksIHAucGFyc2VRdWVyeVBhcmFtcygpLCBwLnBhcnNlRnJhZ21lbnQoKSk7XG4gIH1cblxuICBzZXJpYWxpemUodHJlZTogVXJsVHJlZSk6IHN0cmluZyB7IFxuICAgIGNvbnN0IG5vZGUgPSBzZXJpYWxpemVVcmxUcmVlTm9kZShyb290Tm9kZSh0cmVlKSk7XG4gICAgY29uc3QgcXVlcnkgPSBzZXJpYWxpemVRdWVyeVBhcmFtcyh0cmVlLnF1ZXJ5UGFyYW1ldGVycyk7XG4gICAgY29uc3QgZnJhZ21lbnQgPSB0cmVlLmZyYWdtZW50ICE9PSBudWxsID8gYCMke3RyZWUuZnJhZ21lbnR9YCA6ICcnO1xuICAgIHJldHVybiBgJHtub2RlfSR7cXVlcnl9JHtmcmFnbWVudH1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZVVybFRyZWVOb2RlKG5vZGU6IFRyZWVOb2RlPFVybFNlZ21lbnQ+KTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3NlcmlhbGl6ZVNlZ21lbnQobm9kZS52YWx1ZSl9JHtzZXJpYWxpemVDaGlsZHJlbihub2RlKX1gO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVVcmxUcmVlTm9kZXMobm9kZXM6IFRyZWVOb2RlPFVybFNlZ21lbnQ+W10pOiBzdHJpbmcge1xuICBjb25zdCBwcmltYXJ5ID0gc2VyaWFsaXplU2VnbWVudChub2Rlc1swXS52YWx1ZSk7XG4gIGNvbnN0IHNlY29uZGFyeU5vZGVzID0gbm9kZXMuc2xpY2UoMSk7XG4gIGNvbnN0IHNlY29uZGFyeSA9IHNlY29uZGFyeU5vZGVzLmxlbmd0aCA+IDAgPyBgKCR7c2Vjb25kYXJ5Tm9kZXMubWFwKHNlcmlhbGl6ZVVybFRyZWVOb2RlKS5qb2luKFwiLy9cIil9KWAgOiBcIlwiO1xuICBjb25zdCBjaGlsZHJlbiA9IHNlcmlhbGl6ZUNoaWxkcmVuKG5vZGVzWzBdKTtcbiAgcmV0dXJuIGAke3ByaW1hcnl9JHtzZWNvbmRhcnl9JHtjaGlsZHJlbn1gO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVDaGlsZHJlbihub2RlOiBUcmVlTm9kZTxVcmxTZWdtZW50Pik6IHN0cmluZyB7XG4gIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gYC8ke3NlcmlhbGl6ZVVybFRyZWVOb2Rlcyhub2RlLmNoaWxkcmVuKX1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVTZWdtZW50KHNlZ21lbnQ6IFVybFNlZ21lbnQpOiBzdHJpbmcge1xuICBjb25zdCBvdXRsZXQgPSBzZWdtZW50Lm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQgPyAnJyA6IGAke3NlZ21lbnQub3V0bGV0fTpgO1xuICByZXR1cm4gYCR7b3V0bGV0fSR7c2VnbWVudC5wYXRofSR7c2VyaWFsaXplUGFyYW1zKHNlZ21lbnQucGFyYW1ldGVycyl9YDtcbn1cblxuZnVuY3Rpb24gc2VyaWFsaXplUGFyYW1zKHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBzdHJpbmcge1xuICByZXR1cm4gcGFpcnMocGFyYW1zKS5tYXAocCA9PiBgOyR7cC5maXJzdH09JHtwLnNlY29uZH1gKS5qb2luKFwiXCIpO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVRdWVyeVBhcmFtcyhwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogc3RyaW5nIHtcbiAgY29uc3Qgc3RycyA9IHBhaXJzKHBhcmFtcykubWFwKHAgPT4gYCR7cC5maXJzdH09JHtwLnNlY29uZH1gKTtcbiAgcmV0dXJuIHN0cnMubGVuZ3RoID4gMCA/IGA/JHtzdHJzLmpvaW4oXCImXCIpfWAgOiBcIlwiO1xufVxuXG5jbGFzcyBQYWlyPEEsQj4geyBjb25zdHJ1Y3RvcihwdWJsaWMgZmlyc3Q6QSwgcHVibGljIHNlY29uZDpCKSB7fSB9XG5mdW5jdGlvbiBwYWlyczxUPihvYmo6IHtba2V5OiBzdHJpbmddOiBUfSk6UGFpcjxzdHJpbmcsVD5bXSB7XG4gIGNvbnN0IHJlcyA9IFtdO1xuICBmb3IgKGxldCBwcm9wIGluIG9iaikge1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgIHJlcy5wdXNoKG5ldyBQYWlyPHN0cmluZywgVD4ocHJvcCwgb2JqW3Byb3BdKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmNvbnN0IFNFR01FTlRfUkUgPSAvXlteXFwvXFwoXFwpXFw/Oz0mI10rLztcbmZ1bmN0aW9uIG1hdGNoVXJsU2VnbWVudChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIFNFR01FTlRfUkUubGFzdEluZGV4ID0gMDtcbiAgdmFyIG1hdGNoID0gU0VHTUVOVF9SRS5leGVjKHN0cik7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIDogJyc7XG59XG5cbmNvbnN0IFFVRVJZX1BBUkFNX1ZBTFVFX1JFID0gL15bXlxcKFxcKVxcPzsmI10rLztcbmZ1bmN0aW9uIG1hdGNoVXJsUXVlcnlQYXJhbVZhbHVlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgUVVFUllfUEFSQU1fVkFMVUVfUkUubGFzdEluZGV4ID0gMDtcbiAgY29uc3QgbWF0Y2ggPSBRVUVSWV9QQVJBTV9WQUxVRV9SRS5leGVjKHN0cik7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIDogJyc7XG59XG5cbmNsYXNzIFVybFBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVtYWluaW5nOiBzdHJpbmcpIHt9XG5cbiAgcGVla1N0YXJ0c1dpdGgoc3RyOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucmVtYWluaW5nLnN0YXJ0c1dpdGgoc3RyKTsgfVxuXG4gIGNhcHR1cmUoc3RyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucmVtYWluaW5nLnN0YXJ0c1dpdGgoc3RyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBcIiR7c3RyfVwiLmApO1xuICAgIH1cbiAgICB0aGlzLnJlbWFpbmluZyA9IHRoaXMucmVtYWluaW5nLnN1YnN0cmluZyhzdHIubGVuZ3RoKTtcbiAgfVxuXG4gIHBhcnNlUm9vdFNlZ21lbnQoKTogVHJlZU5vZGU8VXJsU2VnbWVudD4ge1xuICAgIGlmICh0aGlzLnJlbWFpbmluZyAgPT0gJycgfHwgdGhpcy5yZW1haW5pbmcgPT0gJy8nKSB7XG4gICAgICByZXR1cm4gbmV3IFRyZWVOb2RlPFVybFNlZ21lbnQ+KG5ldyBVcmxTZWdtZW50KCcnLCB7fSwgUFJJTUFSWV9PVVRMRVQpLCBbXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlZ21lbnRzID0gdGhpcy5wYXJzZVNlZ21lbnRzKGZhbHNlKTtcbiAgICAgIHJldHVybiBuZXcgVHJlZU5vZGU8VXJsU2VnbWVudD4obmV3IFVybFNlZ21lbnQoJycsIHt9LCBQUklNQVJZX09VVExFVCksIHNlZ21lbnRzKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZVNlZ21lbnRzKGhhc091dGxldE5hbWU6IGJvb2xlYW4pOiBUcmVlTm9kZTxVcmxTZWdtZW50PltdIHtcbiAgICBpZiAodGhpcy5yZW1haW5pbmcubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGVla1N0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgdGhpcy5jYXB0dXJlKCcvJyk7XG4gICAgfVxuICAgIGxldCBwYXRoID0gbWF0Y2hVcmxTZWdtZW50KHRoaXMucmVtYWluaW5nKTtcbiAgICB0aGlzLmNhcHR1cmUocGF0aCk7XG5cbiAgICBsZXQgb3V0bGV0TmFtZTtcbiAgICBpZiAoaGFzT3V0bGV0TmFtZSkge1xuICAgICAgaWYgKHBhdGguaW5kZXhPZihcIjpcIikgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBvdXRsZXQgbmFtZSBpcyBwcm92aWRlZFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXRoLmluZGV4T2YoXCI6XCIpID4gLTEgJiYgaGFzT3V0bGV0TmFtZSkge1xuICAgICAgICBsZXQgcGFydHMgPSBwYXRoLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgb3V0bGV0TmFtZSA9IHBhcnRzWzBdO1xuICAgICAgICBwYXRoID0gcGFydHNbMV07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwYXRoLmluZGV4T2YoXCI6XCIpID4gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IG91dGxldCBuYW1lIGlzIGFsbG93ZWRcIik7XG4gICAgICB9XG4gICAgICBvdXRsZXROYW1lID0gUFJJTUFSWV9PVVRMRVQ7XG4gICAgfVxuXG4gICAgbGV0IG1hdHJpeFBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgICBpZiAodGhpcy5wZWVrU3RhcnRzV2l0aCgnOycpKSB7XG4gICAgICBtYXRyaXhQYXJhbXMgPSB0aGlzLnBhcnNlTWF0cml4UGFyYW1zKCk7XG4gICAgfVxuXG4gICAgbGV0IHNlY29uZGFyeSA9IFtdO1xuICAgIGlmICh0aGlzLnBlZWtTdGFydHNXaXRoKCcoJykpIHtcbiAgICAgIHNlY29uZGFyeSA9IHRoaXMucGFyc2VTZWNvbmRhcnlTZWdtZW50cygpO1xuICAgIH1cblxuICAgIGxldCBjaGlsZHJlbjogVHJlZU5vZGU8VXJsU2VnbWVudD5bXSA9IFtdO1xuICAgIGlmICh0aGlzLnBlZWtTdGFydHNXaXRoKCcvJykgJiYgIXRoaXMucGVla1N0YXJ0c1dpdGgoJy8vJykpIHtcbiAgICAgIHRoaXMuY2FwdHVyZSgnLycpO1xuICAgICAgY2hpbGRyZW4gPSB0aGlzLnBhcnNlU2VnbWVudHMoZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbnN0IHNlZ21lbnQgPSBuZXcgVXJsU2VnbWVudChwYXRoLCBtYXRyaXhQYXJhbXMsIG91dGxldE5hbWUpO1xuICAgIGNvbnN0IG5vZGUgPSBuZXcgVHJlZU5vZGU8VXJsU2VnbWVudD4oc2VnbWVudCwgY2hpbGRyZW4pO1xuICAgIHJldHVybiBbbm9kZV0uY29uY2F0KHNlY29uZGFyeSk7XG4gIH1cblxuICBwYXJzZVF1ZXJ5UGFyYW1zKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICB2YXIgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIGlmICh0aGlzLnBlZWtTdGFydHNXaXRoKCc/JykpIHtcbiAgICAgIHRoaXMuY2FwdHVyZSgnPycpO1xuICAgICAgdGhpcy5wYXJzZVF1ZXJ5UGFyYW0ocGFyYW1zKTtcbiAgICAgIHdoaWxlICh0aGlzLnJlbWFpbmluZy5sZW5ndGggPiAwICYmIHRoaXMucGVla1N0YXJ0c1dpdGgoJyYnKSkge1xuICAgICAgICB0aGlzLmNhcHR1cmUoJyYnKTtcbiAgICAgICAgdGhpcy5wYXJzZVF1ZXJ5UGFyYW0ocGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuXG4gIHBhcnNlRnJhZ21lbnQoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMucGVla1N0YXJ0c1dpdGgoJyMnKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVtYWluaW5nLnN1YnN0cmluZygxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcGFyc2VNYXRyaXhQYXJhbXMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHZhciBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgd2hpbGUgKHRoaXMucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgdGhpcy5wZWVrU3RhcnRzV2l0aCgnOycpKSB7XG4gICAgICB0aGlzLmNhcHR1cmUoJzsnKTtcbiAgICAgIHRoaXMucGFyc2VQYXJhbShwYXJhbXMpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgcGFyc2VQYXJhbShwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIGtleSA9IG1hdGNoVXJsU2VnbWVudCh0aGlzLnJlbWFpbmluZyk7XG4gICAgaWYgKCFrZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jYXB0dXJlKGtleSk7XG4gICAgdmFyIHZhbHVlOiBhbnkgPSBcInRydWVcIjtcbiAgICBpZiAodGhpcy5wZWVrU3RhcnRzV2l0aCgnPScpKSB7XG4gICAgICB0aGlzLmNhcHR1cmUoJz0nKTtcbiAgICAgIHZhciB2YWx1ZU1hdGNoID0gbWF0Y2hVcmxTZWdtZW50KHRoaXMucmVtYWluaW5nKTtcbiAgICAgIGlmICh2YWx1ZU1hdGNoKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWVNYXRjaDtcbiAgICAgICAgdGhpcy5jYXB0dXJlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJhbXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcGFyc2VRdWVyeVBhcmFtKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIga2V5ID0gbWF0Y2hVcmxTZWdtZW50KHRoaXMucmVtYWluaW5nKTtcbiAgICBpZiAoIWtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNhcHR1cmUoa2V5KTtcbiAgICB2YXIgdmFsdWU6IGFueSA9IFwidHJ1ZVwiO1xuICAgIGlmICh0aGlzLnBlZWtTdGFydHNXaXRoKCc9JykpIHtcbiAgICAgIHRoaXMuY2FwdHVyZSgnPScpO1xuICAgICAgdmFyIHZhbHVlTWF0Y2ggPSBtYXRjaFVybFF1ZXJ5UGFyYW1WYWx1ZSh0aGlzLnJlbWFpbmluZyk7XG4gICAgICBpZiAodmFsdWVNYXRjaCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlTWF0Y2g7XG4gICAgICAgIHRoaXMuY2FwdHVyZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHBhcmFtc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwYXJzZVNlY29uZGFyeVNlZ21lbnRzKCk6IFRyZWVOb2RlPFVybFNlZ21lbnQ+W10ge1xuICAgIHZhciBzZWdtZW50cyA9IFtdO1xuICAgIHRoaXMuY2FwdHVyZSgnKCcpO1xuXG4gICAgd2hpbGUgKCF0aGlzLnBlZWtTdGFydHNXaXRoKCcpJykgJiYgdGhpcy5yZW1haW5pbmcubGVuZ3RoID4gMCkge1xuICAgICAgc2VnbWVudHMgPSBzZWdtZW50cy5jb25jYXQodGhpcy5wYXJzZVNlZ21lbnRzKHRydWUpKTtcbiAgICAgIGlmICh0aGlzLnBlZWtTdGFydHNXaXRoKCcvLycpKSB7XG4gICAgICAgIHRoaXMuY2FwdHVyZSgnLy8nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jYXB0dXJlKCcpJyk7XG5cbiAgICByZXR1cm4gc2VnbWVudHM7XG4gIH1cbn1cbiJdfQ==