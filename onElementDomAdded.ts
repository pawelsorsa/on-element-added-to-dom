import { Subject } from 'rxjs';
import $ from '../../jquery/jqueryFacade';

function onElementDomAdded(selector: string,
  container: Document | HTMLElement = document) {
  const sub = new Subject<HTMLElement>();

  const observer = new MutationObserver((mutations) => {
    for (let m = 0; m < mutations.length; m += 1) {
      const nodes = Array.from(mutations[m].addedNodes).map((el) => el);

      nodes.forEach((node) => {
        const obj = $(node);
        const parent = $(obj.parent());
        const [target] = Array.from(parent?.find(selector))
          .filter((htmlEl) => htmlEl === node)
          .map((o) => o as HTMLElement);

        if (target) {
          sub.next(target);
        }
      });
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  return sub.asObservable();
}

export default onElementDomAdded;
