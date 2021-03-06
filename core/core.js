import es6Promise from 'es6-promise';

import Editor from './Editor';
import templates from './templates';
import { getHeaders, getParameterByName } from '../sc_utils';
import './css/editing_ui.css';
import './css/reveal_override.css';

es6Promise.polyfill();

(() => {
  const action = getParameterByName('action');

  window.sc_mode = {
    anonymous: true,
  };

  window.RevealEditor = new Editor({
    reveal: document.querySelector('.reveal'),
  });

  const run = (html) => {
    window.RevealEditor.afterInstanciated(html);
  };

  const anonymousModeRun = () => {
    window.sc_mode.anonymous = true;
    run(window.localStorage.getItem('snapshot_anonymous') || templates.slidesTemplates.default);
  };

  const authenticatedModeRun = (html) => {
    window.sc_mode.anonymous = false;
    run(html);
  };

  switch (action) {
    case 'edit': {
      const work_id = getParameterByName('work_id');
      if (!work_id) {
        anonymousModeRun();
        return;
      }

      window.sc_mode = {
        anonymous: false,
        action,
        work_id,
      };

      const payload = {
        method: 'GET',
        headers: getHeaders(),
      };

      fetch(`/api/works/created?work_id=${work_id}`, payload)
      .then(res => res.json())
      .then((ret) => {
        if (ret.success) {
          authenticatedModeRun(ret.content);
          return true;
        }
        window.location.replace('/#/user/login');
        return false;
      })
      .catch(() => {
        window.location.replace('/#/user/login');
      });

      break;
    }
    case 'tryit':
    default: {
      anonymousModeRun();
    }
  }
})();
