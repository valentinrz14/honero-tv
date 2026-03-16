package com.honerotv

import android.app.SearchManager
import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // Switch from SplashTheme to AppTheme before React renders
    setTheme(R.style.AppTheme)
    super.onCreate(savedInstanceState)
    handleSearchIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleSearchIntent(intent)
  }

  private fun handleSearchIntent(intent: Intent?) {
    if (intent == null) return

    val query = when (intent.action) {
      Intent.ACTION_SEARCH -> intent.getStringExtra(SearchManager.QUERY)
      "com.google.android.gms.actions.SEARCH_ACTION" -> intent.getStringExtra(SearchManager.QUERY)
      Intent.ACTION_VIEW -> {
        // Handle deep link: honerotv://play?channel=telefe
        val uri = intent.data
        if (uri != null && uri.scheme == "honerotv") {
          uri.getQueryParameter("channel")
        } else {
          intent.getStringExtra(SearchManager.QUERY)
        }
      }
      else -> null
    }

    if (!query.isNullOrBlank()) {
      emitVoiceSearch(query)
    }
  }

  private fun emitVoiceSearch(query: String) {
    try {
      val reactContext = reactInstanceManager?.currentReactContext
      if (reactContext != null) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          ?.emit("voiceSearch", query)
        pendingSearchQuery = null
        return
      }
    } catch (_: Exception) {}
    // React context not yet ready - store for later
    pendingSearchQuery = query
  }

  // If React wasn't ready when intent arrived, send on resume
  override fun onResume() {
    super.onResume()
    pendingSearchQuery?.let { emitVoiceSearch(it) }
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "HorneroTV"

  /**
   * Returns the instance of the [ReactActivityDelegate].
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  companion object {
    private var pendingSearchQuery: String? = null
  }
}
