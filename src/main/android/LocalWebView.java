package com.example.kenhuang.utils;

import android.app.Activity;
import android.content.Context;
import android.util.AttributeSet;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Created by kenhuang on 2019/1/17.
 */

/**
 *
 * android16可以直接使用 this.addJavascriptInterface(对象,'对象在h5中的window属性名');添加供h5的js控制的对象。
 * android17以上还需要在对应的方法加上@JavascriptInterface注解即可。
 */
public class LocalWebView extends WebView {
    public LocalWebView(Context context) {
        super(context);
        this.init();
    }

    public LocalWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.init();
    }

    public LocalWebView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.init();

    }

    private void init(){
        WebSettings webSettings = this.getSettings();
        webSettings.setJavaScriptEnabled(true);
        //不打开外部浏览器
        this.setWebViewClient(new WebViewClient());
    }

    public void invokeJS(String functionName,Object... args){
        String parameters = "";
        int i = 0;
        for (; i < args.length - 1 ; i++) {
            parameters +=args[i] + ",";
        }
        parameters += args[i];
        this.loadUrl("javascript:"+functionName+"("+"'"+parameters+"'"+")");
    }
    public void invokeJava(String functionName,String... args){

    }

}
