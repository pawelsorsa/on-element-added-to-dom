import { JSDOM } from 'jsdom';
import { tap } from 'rxjs/operators';
import waitForDomToLoad from '../../testUtils/waitForDomToLoad';

let dom: JSDOM;
let container: HTMLElement;
let document: Document;
let onElementDomAddedFn: any;
let $: any;

describe('On element added to dom observable tests', () => {
  jest.dontMock('fs');

  beforeAll(() => waitForDomToLoad('mock').then((newDom: JSDOM) => {
    dom = newDom;
    global.MutationObserver = dom.window.MutationObserver;
    document = dom.window.document;
    global.window = dom.window as any;

    import('./onElementDomAdded').then((_onElementDomAdded) => {
      onElementDomAddedFn = _onElementDomAdded.default;
    });

    import('../../jquery/jqueryFacade').then((jQuery) => {
      $ = jQuery.default;
    });
  }));

  beforeEach(() => {
    container = document.body;
  });

  afterEach(() => {
    container = null;
  });

  it('onElementDomAdded should emmit once element is added to dom', (done) => {
    const divId = 'dummy-div-id';
    const div = document.createElement('div');
    div.id = divId;

    container.appendChild(div);
    onElementDomAddedFn(`#${divId}`, container).subscribe((el: HTMLElement) => {
      expect(div).toBe(el);
      done();
    });

    container.appendChild(div);
  });

  it('onElementDomAdded should emmit once jquery element is added to dom', (done) => {
    const divId = 'dummy-div-id2';
    const jQueryDiv = $(`<div id='${divId}'></div>`);

    onElementDomAddedFn(`#${divId}`, container).subscribe((el: HTMLElement) => {
      expect(jQueryDiv[0]).toBe(el);
      done();
    });

    $(container).append(jQueryDiv);
  });

  it('onElementDomAdded should emmit each time the element is added', (done) => {
    const divId = 'dummy-div-id3';
    const div = document.createElement('div');
    div.id = divId;

    let c = 0;
    onElementDomAddedFn(`#${divId}`, container).pipe(
      tap(() => { c += 1; }),
    ).subscribe(() => {
      if (c === 3) {
        expect(c).toBe(3);
        done();
      }
    });

    container.appendChild(div);
    container.appendChild(div);
    container.appendChild(div);
  });
});
