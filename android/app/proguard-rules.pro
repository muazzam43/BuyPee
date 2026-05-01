# ===============================
# React Native (core)
# ===============================
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }
-keep class com.facebook.soloader.** { *; }
-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.react.bridge.**
-dontwarn com.facebook.react.uimanager.**
-dontwarn com.facebook.react.modules.storage.**

# Hermes
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# ===============================
# Firebase
# ===============================
-dontwarn com.google.firebase.messaging.**
-dontwarn com.google.firebase.iid.**
-dontwarn com.google.firebase.installations.**
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

# ===============================
# OkHttp (used internally by React Native & Firebase)
# ===============================
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# ===============================
# Gson (used by Firebase & RN)
# ===============================
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# ===============================
# AndroidX / Support
# ===============================
-dontwarn androidx.**
-dontwarn android.support.**

# ===============================
# Prevent stripping of resources used by reflection
# ===============================
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}
