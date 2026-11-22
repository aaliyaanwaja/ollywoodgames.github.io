import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import appConfig from './app.json';
import { handlePageMessage, openExternal, type BridgeContext } from './src/bridge';
import { GAME_HTML } from './src/game-html';
import {
  BASE_URL,
  backScript,
  bootstrapScript,
  insetsScript,
  isOwnUrl,
  receiveScript,
  setActiveScript,
  withBootstrap,
} from './src/page-script';
import { loadSave } from './src/storage';

const PAPER = '#F2EAD8';
const VERSION = appConfig.expo.version;
/* If the page does not answer the back button within this time (it is still loading, or its renderer died),
   the press is treated as "nothing to go back to". */
const BACK_TIMEOUT_MS = 500;

/* react-native-webview declares `WebView<P = undefined>` with props `WebViewProps & P`, which TypeScript 6 reduces
   to `never`. Naming the type parameter restores the real prop types; it is the same component at runtime. */
const GameWebView = WebView<object>;
type GameWebView = WebView<object>;

// Keep the native splash up until the stored save has been read and the page has loaded.
SplashScreen.preventAutoHideAsync().catch(() => {});

function Game() {
  const insets = useSafeAreaInsets();
  const web = useRef<GameWebView>(null);
  const insetsNow = useRef(insets);
  const save = useRef<string | null>(null); // newest save known to the shell, for a renderer restart
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false); // stored save has been read
  const [generation, setGeneration] = useState(0); // bumped to rebuild the page after a renderer crash

  // 1. Read the stored save BEFORE the WebView exists, so the page boots with it.
  useEffect(() => {
    let alive = true;
    loadSave().then(v => {
      if (!alive) return;
      save.current = v;
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // 2. The page, with the bootstrap script first in <head>. Rebuilt only when the page must be reloaded.
  const page = useMemo(() => {
    if (!ready) return null;
    const script = bootstrapScript({ save: save.current, version: VERSION, insets: insetsNow.current, platform: Platform.OS });
    return { script, source: { html: withBootstrap(GAME_HTML, script), baseUrl: BASE_URL } };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `generation` is the reload trigger
  }, [ready, generation]);

  // 3. Insets can change while running (gesture/3-button switch, foldables): tell the page, do not reload it.
  useEffect(() => {
    insetsNow.current = insets;
    web.current?.injectJavaScript(insetsScript(insets));
  }, [insets]);

  // 4. Background / foreground: freeze the game and silence Web Audio; resume audio on return.
  //    iOS reports 'inactive' first (app switcher, Control Centre, an incoming call, the lock button) and only then
  //    'background'. Anything but 'active' freezes the game, so the script runs while the app can still run it.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      web.current?.injectJavaScript(setActiveScript(state === 'active'));
    });
    return () => sub.remove();
  }, []);

  // 5. Hardware back (Android only; iOS has no back button and BackHandler never fires there): the page decides.
  //    Only when it has nowhere to go back to does the app step aside.
  const leave = useCallback(() => {
    if (backTimer.current) clearTimeout(backTimer.current);
    backTimer.current = null;
    // On Expo's Android activity this moves the task to the background; it does not kill the process.
    BackHandler.exitApp();
  }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!web.current) return false;
      if (backTimer.current) clearTimeout(backTimer.current);
      backTimer.current = setTimeout(leave, BACK_TIMEOUT_MS);
      web.current.injectJavaScript(backScript());
      return true;
    });
    return () => {
      sub.remove();
      if (backTimer.current) clearTimeout(backTimer.current);
    };
  }, [leave]);

  const bridge = useMemo<BridgeContext>(
    () => ({
      rememberSave: v => {
        save.current = v;
      },
      onBack: handled => {
        if (backTimer.current) clearTimeout(backTimer.current);
        backTimer.current = null;
        if (!handled) leave();
      },
      reply: msg => web.current?.injectJavaScript(receiveScript(msg)),
    }),
    [leave],
  );

  const hideSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!page) return <View style={styles.fill} />;

  return (
    <View style={styles.fill}>
      <StatusBar style="dark" />
      <GameWebView
        key={generation}
        ref={web}
        style={styles.web}
        containerStyle={styles.web}
        source={page.source}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={page.script}
        onMessage={e => handlePageMessage(e.nativeEvent.data, bridge)}
        onLoadEnd={hideSplash}
        onError={hideSplash}
        // Anything that is not the game's own document opens in the system browser instead.
        onShouldStartLoadWithRequest={req => {
          if (isOwnUrl(req.url)) return true;
          openExternal(req.url);
          return false;
        }}
        // Last line of defence: if a foreign page ever did load, throw the WebView away and start the game again.
        onNavigationStateChange={nav => {
          if (/^https?:\/\//i.test(nav.url) && !isOwnUrl(nav.url)) setGeneration(g => g + 1);
        }}
        // Android can kill the WebView's renderer under memory pressure; rebuild it with the newest save.
        onRenderProcessGone={() => setGeneration(g => g + 1)}
        // iOS does the same to WKWebView's content process, typically while the app sits in the background.
        // Without this the player would come back to a blank cream screen.
        onContentProcessDidTerminate={() => setGeneration(g => g + 1)}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        androidLayerType="hardware"
        overScrollMode="never"
        bounces={false}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        scalesPageToFit={false}
        textZoom={100}
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={false}
        allowFileAccess={false}
        allowsFullscreenVideo={false}
        geolocationEnabled={false}
        thirdPartyCookiesEnabled={false}
        saveFormDataDisabled
        forceDarkOn={false}
        // ---- iOS (WKWebView). Each line is explained in README, "iOS behaviour". ----
        allowsInlineMediaPlayback
        allowsAirPlayForMediaPlayback={false}
        allowsPictureInPictureMediaPlayback={false}
        allowsBackForwardNavigationGestures={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        dataDetectorTypes="none"
        pullToRefreshEnabled={false}
        directionalLockEnabled
        sharedCookiesEnabled={false}
        textInteractionEnabled={false}
        allowsLinkPreview={false}
        // Do NOT add `menuItems` (even an empty list) to hide the selection menu: on iOS it installs a 0.4 s
        // long-press recogniser that cancels touches in the WebView, which would break hold-to-aim.
        webviewDebuggingEnabled={__DEV__}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={styles.fill}>
      <Game />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: PAPER },
  web: { flex: 1, backgroundColor: PAPER },
});
