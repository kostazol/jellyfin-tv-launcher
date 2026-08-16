(function () {
  'use strict';

  var translations = {
    en: {
      startingJellyfin: 'Starting Jellyfin',
      checkingJellyfinServer: 'Checking Jellyfin server',
      jellyfin: 'Jellyfin',
      serverAddress: 'Server address',
      connect: 'Connect',
      jellyfinServerUnavailable: 'Jellyfin server is unavailable',
      checkServerAddress: 'Check the server address and try again.',
      savedServerUnavailable: 'Could not reach this Jellyfin server. It may be offline, blocked by CORS, or use an invalid address.',
      enterServerAddress: 'Enter your Jellyfin server address.',
      requiresHttps: 'This launcher requires an HTTPS Jellyfin address.',
      serverUnavailableAtAddress: 'Could not reach a Jellyfin server at this address. Check address and try again.',
      connectTv: 'Connect this TV to your Jellyfin server.',
      httpServerAddress: 'HTTP server address',
      httpNetworkWarning: 'HTTP is recommended only within your local network. It is not encrypted and may expose traffic on public or untrusted networks.',
      httpCannotVerify: 'This HTTPS launcher cannot verify an HTTP server before opening it.',
      continueToServer: 'Continue to this server?',
      cancel: 'Cancel',
      continue: 'Continue'
    },
    ru: {
      startingJellyfin: 'Запуск Jellyfin',
      checkingJellyfinServer: 'Проверка сервера Jellyfin',
      jellyfin: 'Jellyfin',
      serverAddress: 'Адрес сервера',
      connect: 'Подключиться',
      jellyfinServerUnavailable: 'Сервер Jellyfin недоступен',
      checkServerAddress: 'Проверьте адрес сервера и попробуйте снова.',
      savedServerUnavailable: 'Не удалось подключиться к серверу Jellyfin. Возможно, сервер выключен, недоступен из сети или указан неверный адрес.',
      enterServerAddress: 'Введите адрес сервера Jellyfin.',
      requiresHttps: 'Для этого launcher требуется HTTPS-адрес Jellyfin.',
      serverUnavailableAtAddress: 'Не удалось найти сервер Jellyfin по этому адресу. Проверьте адрес и попробуйте снова.',
      connectTv: 'Подключите этот телевизор к вашему серверу Jellyfin.',
      httpServerAddress: 'Адрес HTTP-сервера',
      httpNetworkWarning: 'HTTP рекомендуется использовать только в локальной сети. Соединение не шифруется и может раскрыть данные в публичных или недоверенных сетях.',
      httpCannotVerify: 'Этот HTTPS launcher не может проверить HTTP-сервер перед открытием.',
      continueToServer: 'Продолжить подключение к этому серверу?',
      cancel: 'Отмена',
      continue: 'Продолжить'
    }
  };
  var activeLocale = detectLocale();
  var dictionary = translations[activeLocale] || translations.en;
  var storageKey = 'jellyfinTvLauncherServerUrl';
  var splashDuration = 1500;
  var splash = document.getElementById('startup-splash');
  var splashStatus = document.getElementById('startup-status');
  var screen = document.getElementById('connection-screen');
  var title = document.getElementById('screen-title');
  var description = document.getElementById('screen-description');
  var form = document.getElementById('connection-form');
  var serverAddressLabel = document.getElementById('server-address-label');
  var input = document.getElementById('server-address');
  var button = document.getElementById('connect-button');
  var buttonLabel = button.getElementsByTagName('span')[0];
  var spinner = button.getElementsByTagName('span')[1];
  var error = document.getElementById('connection-error');
  var httpWarning = document.getElementById('http-warning');
  var httpWarningTitle = document.getElementById('http-warning-title');
  var httpWarningDescription = document.getElementById('http-warning-description');
  var httpWarningVerification = document.getElementById('http-warning-verification');
  var httpWarningContinue = document.getElementById('http-warning-continue');
  var httpCancelButton = document.getElementById('http-cancel-button');
  var httpContinueButton = document.getElementById('http-continue-button');
  var remoteLeft = getRemoteKeyCode('VK_LEFT', 37);
  var remoteUp = getRemoteKeyCode('VK_UP', 38);
  var remoteRight = getRemoteKeyCode('VK_RIGHT', 39);
  var remoteDown = getRemoteKeyCode('VK_DOWN', 40);
  var splashFinished = false;
  var startupInterrupted = false;
  var savedServerUrl = readSavedServerUrl();
  var pendingHttpServerUrl = '';

  setDocumentLanguage();
  applyTranslations();

  function detectLocale() {
    var locale;

    try {
      if (typeof navigator === 'undefined') {
        return 'en';
      }

      if (navigator.languages && typeof navigator.languages[0] === 'string') {
        locale = navigator.languages[0];
      }

      if (!locale && typeof navigator.language === 'string') {
        locale = navigator.language;
      }

      if (!locale && typeof navigator.userLanguage === 'string') {
        locale = navigator.userLanguage;
      }

      return /^ru(?:[-_]|$)/i.test(locale) ? 'ru' : 'en';
    } catch (exception) {
      return 'en';
    }
  }

  function setDocumentLanguage() {
    try {
      document.documentElement.lang = activeLocale;
    } catch (exception) {
      activeLocale = 'en';
      dictionary = translations.en;
    }
  }

  function t(key) {
    var value;

    try {
      value = dictionary[key];
      if (typeof value !== 'string') {
        value = translations.en[key];
      }

      return typeof value === 'string' ? value : typeof key === 'string' ? key : '';
    } catch (exception) {
      return typeof key === 'string' ? key : '';
    }
  }

  function getRemoteKeyCode(name, fallback) {
    try {
      return typeof window[name] === 'number' ? window[name] : fallback;
    } catch (exception) {
      return fallback;
    }
  }

  function applyTranslations() {
    splashStatus.textContent = t('startingJellyfin');
    title.textContent = t('jellyfin');
    description.textContent = t('connectTv');
    serverAddressLabel.textContent = t('serverAddress');
    buttonLabel.textContent = t('connect');
    httpWarningTitle.textContent = t('httpServerAddress');
    httpWarningDescription.textContent = t('httpNetworkWarning');
    httpWarningVerification.textContent = t('httpCannotVerify');
    httpWarningContinue.textContent = t('continueToServer');
    httpCancelButton.textContent = t('cancel');
    httpContinueButton.textContent = t('continue');
  }

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

  function handleDirectionalNavigation(event) {
    var keyCode = event.keyCode || event.which;
    var activeElement = document.activeElement;
    var isArrowKey = keyCode === remoteLeft || keyCode === remoteUp || keyCode === remoteRight || keyCode === remoteDown;

    if (!isArrowKey) {
      return;
    }

    if (!httpWarning.hidden) {
      if (activeElement === httpCancelButton && (keyCode === remoteRight || keyCode === remoteDown)) {
        httpContinueButton.focus();
      } else if (activeElement === httpContinueButton && (keyCode === remoteLeft || keyCode === remoteUp)) {
        httpCancelButton.focus();
      } else {
        return;
      }

      event.preventDefault();
      return;
    }

    if (screen.hidden) {
      return;
    }

    if (activeElement === input) {
      button.focus();
    } else if (activeElement === button) {
      input.focus();
    } else {
      return;
    }

    event.preventDefault();
  }

  function showConnectionForm(unavailable) {
    splash.style.display = 'none';
    screen.hidden = false;
    title.textContent = unavailable ? t('jellyfinServerUnavailable') : t('jellyfin');
    description.textContent = unavailable ? t('checkServerAddress') : t('connectTv');
    input.value = savedServerUrl;

    if (unavailable) {
      showError(t('savedServerUnavailable'));
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
          if (splashFinished && !startupInterrupted) {
            finishStartup(checkSuccess);
          }
        });
      }
    }

    window.setTimeout(function () {
      splashFinished = true;
      if (startupInterrupted) {
        return;
      }

      if (checkComplete) {
        finishStartup(checkSuccess);
      } else {
        splashStatus.textContent = t('checkingJellyfinServer');
      }
    }, splashDuration);
  }

  form.addEventListener('submit', function (event) {
    var serverUrl;

    event.preventDefault();
    error.hidden = true;
    serverUrl = normalizeServerUrl(input.value);

    if (!serverUrl) {
      showError(t('enterServerAddress'));
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
      showError(t('serverUnavailableAtAddress'));
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

  document.addEventListener('keydown', function (event) {
    if (splashFinished || startupInterrupted || !savedServerUrl || !isHttpOnSecurePage(savedServerUrl)) {
      handleDirectionalNavigation(event);
      return;
    }

    event.preventDefault();
    startupInterrupted = true;
    showConnectionForm(false);
  });

  beginStartup();
}());
