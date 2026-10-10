package com.clockgame.angleCracker;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import androidx.appcompat.app.AppCompatActivity;

import com.yandex.mobile.ads.common.AdRequestConfiguration;
import com.yandex.mobile.ads.common.AdRequestError;
import com.yandex.mobile.ads.common.AdError;
import com.yandex.mobile.ads.common.ImpressionData;
import com.yandex.mobile.ads.common.InitializationListener;
import com.yandex.mobile.ads.common.MobileAds;
import com.yandex.mobile.ads.rewarded.Reward;
import com.yandex.mobile.ads.rewarded.RewardedAd;
import com.yandex.mobile.ads.rewarded.RewardedAdEventListener;
import com.yandex.mobile.ads.rewarded.RewardedAdLoadListener;
import com.yandex.mobile.ads.rewarded.RewardedAdLoader;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    // ═══ Реклама Яндекса: вознаграждаемое видео в магазине ═══
    private static final String REWARDED_BLOCK_ID = "R-M-20214182-1";
    // true = тестовые demo-объявления (для локальной проверки), false = боевой блок
    private static final boolean ADS_TEST_MODE = false;
    private static final String REWARDED_DEMO_BLOCK_ID = "R-M-DEMO-rewarded-client-side";

    private RewardedAdLoader rewardedAdLoader;
    private RewardedAd rewardedAd;
    private boolean adLoading = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    try {
                        startActivity(new android.content.Intent(
                            android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)));
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());

        // JS-мост: игра вызывает NumbraAds.isAvailable() / NumbraAds.show()
        webView.addJavascriptInterface(new AdsBridge(), "NumbraAds");

        webView.loadUrl("file:///android_asset/index.html");

        initAds();
    }

    // ═══════════════ РЕКЛАМА ═══════════════

    private void initAds() {
        MobileAds.initialize(this, new InitializationListener() {
            @Override
            public void onInitializationCompleted() {
                loadRewarded();
            }
        });
    }

    private String rewardedBlockId() {
        return ADS_TEST_MODE ? REWARDED_DEMO_BLOCK_ID : REWARDED_BLOCK_ID;
    }

    private void loadRewarded() {
        if (rewardedAdLoader == null) {
            rewardedAdLoader = new RewardedAdLoader(this);
            rewardedAdLoader.setAdLoadListener(new RewardedAdLoadListener() {
                @Override
                public void onAdLoaded(RewardedAd ad) {
                    rewardedAd = ad;
                    adLoading = false;
                    notifyAdState();
                }

                @Override
                public void onAdFailedToLoad(AdRequestError error) {
                    rewardedAd = null;
                    adLoading = false;
                    notifyAdState();
                    // повторная загрузка через 30 секунд
                    handler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            loadRewarded();
                        }
                    }, 30000);
                }
            });
        }
        if (!adLoading) {
            adLoading = true;
            AdRequestConfiguration config =
                new AdRequestConfiguration.Builder(rewardedBlockId()).build();
            rewardedAdLoader.loadAd(config);
        }
    }

    private void showRewarded() {
        if (rewardedAd == null) {
            loadRewarded();
            pushJs("window.__adFail && window.__adFail('loading')");
            return;
        }
        final RewardedAd ad = rewardedAd;
        rewardedAd = null; // показывается единожды
        ad.setAdEventListener(new RewardedAdEventListener() {
            @Override
            public void onRewarded(Reward reward) {
                // награда начисляется только за полный просмотр
                pushJs("window.onAdReward && window.onAdReward()");
            }

            @Override
            public void onAdShown() {}

            @Override
            public void onAdClicked() {}

            @Override
            public void onAdImpression(ImpressionData data) {}

            @Override
            public void onAdFailedToShow(AdError error) {
                pushJs("window.__adFail && window.__adFail('show')");
                loadRewarded();
            }

            @Override
            public void onAdDismissed() {
                notifyAdState();
                loadRewarded();
            }
        });
        ad.show(this);
    }

    private void notifyAdState() {
        boolean ready = rewardedAd != null;
        pushJs("window.__adState && window.__adState(" + ready + ")");
    }

    private void pushJs(String js) {
        handler.post(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(js, null);
            }
        });
    }

    private class AdsBridge {

        @JavascriptInterface
        public boolean isAvailable() {
            return rewardedAd != null;
        }

        @JavascriptInterface
        public void show() {
            handler.post(new Runnable() {
                @Override
                public void run() {
                    showRewarded();
                }
            });
        }
    }

    @Override
    protected void onDestroy() {
        if (rewardedAdLoader != null) {
            rewardedAdLoader.cancelLoading();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
