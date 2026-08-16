(function () {
  'use strict';

  var storageKey = 'jellyfinTvLauncherServerUrl';
  var splashDuration = 1500;
  var splash = document.getElementById('startup-splash');
  var splashStatus = document.getElementById('startup-status');
  var screen = document.getElementById('connection-screen');
  var title = document.getElementById('screen-title');
  var description = document.getElementById('screen-description');
  var form = document.getElementById('connection-form');
  var input = document.getElementById('server-address');
  var button = document.getElementById('connect-button');
  var buttonLabel = button.getElementsByTagName('span')[0];
  var spinner = button.getElementsByTagName('span')[1];
  var error = document.getElementById('connection-error');
  var httpWarning = document.getElementById('http-warning');
  var httpCancelButton = document.getElementById('http-cancel-button');
  var httpContinueButton = document.getElementById('http-continue-button');
  var splashFinished = false;
  var savedServerUrl = readSavedServerUrl();
  var pendingHttpServerUrl = '';

  function readSavedServerUrl() {
    try {
      return window.localStorage.getItem(storageKey) || '';
    } catch (exception) {
      return '';
    }
  }

  function saveServerUrl(serverUrl) {
    try {
      window.localStorage.setItem(storageKey, serverUrl);
    } catch (exception) {
    }
  }

  function normalizeServerUrl(value) {
    var serverUrl = (value || '').replace(/^\s+|\s+$/g, '');

    if (!serverUrl) {
      return '';
    }

    if (!/^https?:\/\//i.test(serverUrl)) {
      serverUrl = 'https://' + serverUrl;
    }

    serverUrl = serverUrl.replace(/\/+$/, '').replace(/\/web$/i, '');
    return serverUrl.replace(/\/+$/, '');
  }

  function isHttpOnSecurePage(serverUrl) {
    return window.location.protocol === 'https:' && /^http:\/\//i.test(serverUrl);
  }

  function looksLikeJellyfin(info) {
    var productName;
    var hasIdentity;

    if (!info || typeof info !== 'object') {
      return false;
    }

    productName = typeof info.ProductName === 'string' ? info.ProductName.toLowerCase() : '';
    hasIdentity = typeof info.ServerName === 'string' || productName.indexOf('jellyfin') !== -1;
    return typeof info.Version === 'string' && hasIdentity;
  }

  function checkServer(serverUrl, callback) {
    var request;
    var completed = false;

    try {
      request = new XMLHttpRequest();
      request.open('GET', serverUrl + '/System/Info/Public', true);
      request.timeout = 3000;
      request.onreadystatechange = function () {
        var info;

        if (request.readyState !== 4 || completed) {
          return;
        }

        completed = true;
        if (request.status < 200 || request.status >= 300) {
          callback(false, 'unavailable');
          return;
        }

        try {
          info = JSON.parse(request.responseText);
        } catch (exception) {
          callback(false, 'unavailable');
          return;
        }

        callback(looksLikeJellyfin(info), 'unavailable');
      };
      request.onerror = function () {
        if (!completed) {
          completed = true;
          callback(false, 'unavailable');
        }
      };
      request.ontimeout = request.onerror;
      request.send(null);
    } catch (exception) {
      callback(false, 'unavailable');
    }
  }

  function openServer(serverUrl) {
    window.location.replace(serverUrl + '/web/');
  }

  function setLoading(loading) {
    input.disabled = loading;
    button.disabled = loading;
    buttonLabel.hidden = loading;
    spinner.hidden = !loading;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }

  function showHttpWarning(serverUrl) {
    pendingHttpServerUrl = serverUrl;
    httpWarning.hidden = false;
    httpCancelButton.focus();
  }

  function showConnectionForm(unavailable) {
    splash.style.display = 'none';
    screen.hidden = false;
    title.textContent = unavailable ? 'Jellyfin server is unavailable' : 'Jellyfin';
    description.textContent = unavailable ? 'Check the server address and try again.' : 'Connect this TV to your Jellyfin server.';
    input.value = savedServerUrl;

    if (unavailable) {
      showError('Could not reach this Jellyfin server. It may be offline, blocked by CORS, or use an invalid address.');
    }

    input.focus();
  }

  function finishStartup(success) {
    if (success) {
      openServer(savedServerUrl);
      return;
    }

    showConnectionForm(!!savedServerUrl);
  }

  function beginStartup() {
    var checkComplete = !savedServerUrl;
    var checkSuccess = false;

    if (savedServerUrl) {
      savedServerUrl = normalizeServerUrl(savedServerUrl);
      if (isHttpOnSecurePage(savedServerUrl)) {
        checkComplete = true;
        checkSuccess = true;
      } else {
        checkServer(savedServerUrl, function (success) {
          checkComplete = true;
          checkSuccess = success;
          if (splashFinished) {
            finishStartup(checkSuccess);
          }
        });
      }
    }

    window.setTimeout(function () {
      splashFinished = true;
      if (checkComplete) {
        finishStartup(checkSuccess);
      } else {
        splashStatus.textContent = 'Checking Jellyfin server';
      }
    }, splashDuration);
  }

  form.addEventListener('submit', function (event) {
    var serverUrl;

    event.preventDefault();
    error.hidden = true;
    serverUrl = normalizeServerUrl(input.value);

    if (!serverUrl) {
      showError('Enter your Jellyfin server address.');
      input.focus();
      return;
    }

    if (isHttpOnSecurePage(serverUrl)) {
      showHttpWarning(serverUrl);
      return;
    }

    setLoading(true);
    checkServer(serverUrl, function (success, reason) {
      if (success) {
        saveServerUrl(serverUrl);
        openServer(serverUrl);
        return;
      }

      setLoading(false);
      showError('Could not reach a Jellyfin server at this address. Check address and try again.');
      input.focus();
    });
  });

  httpCancelButton.addEventListener('click', function () {
    pendingHttpServerUrl = '';
    httpWarning.hidden = true;
    input.focus();
  });

  httpContinueButton.addEventListener('click', function () {
    if (!pendingHttpServerUrl) {
      return;
    }

    setLoading(true);
    saveServerUrl(pendingHttpServerUrl);
    openServer(pendingHttpServerUrl);
  });

  beginStartup();
}());
