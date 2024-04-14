<template>
  <div :class="`min-h-screen flex flex-col justify-center overflow-hidden items-center ${base.isMobile ? base.themeName === 'dark' ? 'bg-dark-content' : 'bg-white' : base.themeName === 'dark' ? 'bg-black' : 'bg-login'}`">
    <div ref="outerRef">
      <div ref="cardRef" :class="`bg-white relative dark:bg-dark-content dark:bg-slate-800 pb-20 pt-10 px-10 ${!base.isMobile && 'shadow-xl'}`">
        <div class="absolute w-20 h-10 right-4 top-2 flex justify-center items-center">
          <switch-theme />
        </div>
        <div class="flex flex-col justify-center items-center">
          <svg t="1712821253119" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="31418" width="64" height="64"><path d="M416 620.8c85.333333 0 164.266667-8.533333 228.266667-23.466667 17.066667-66.133333 57.6-132.266667 91.733333-185.6 8.533333-12.8 14.933333-23.466667 21.333333-36.266666-57.6 38.4-189.866667 64-343.466666 64-164.266667 0-302.933333-29.866667-354.133334-72.533334-4.266667-6.4-17.066667-2.133333-17.066666 8.533334V512c0 59.733333 166.4 108.8 373.333333 108.8z" :fill="base.themeName === 'dark' ? '#63e2b7' : '#16AA51'" p-id="31419"></path><path d="M42.666667 279.466667a373.333333 108.8 0 1 0 746.666666 0 373.333333 108.8 0 1 0-746.666666 0Z" :fill="base.themeName === 'dark' ? '#63e2b7' : '#16AA51'" p-id="31420"></path><path d="M635.733333 652.8c-61.866667 12.8-138.666667 21.333333-219.733333 21.333333-164.266667 0-302.933333-29.866667-354.133333-72.533333-6.4-6.4-19.2-2.133333-19.2 6.4v136.533333C42.666667 804.266667 209.066667 853.333333 416 853.333333c115.2 0 219.733333-14.933333 288-38.4-38.4-36.266667-68.266667-89.6-68.266667-162.133333zM861.866667 396.8c-8.533333-14.933333-32-14.933333-40.533334 0-38.4 68.266667-121.6 174.933333-121.6 258.133333 0 87.466667 57.6 130.133333 104.533334 145.066667v17.066667c0 19.2 14.933333 34.133333 34.133333 34.133333s34.133333-14.933333 34.133333-34.133333v-17.066667c46.933333-14.933333 104.533333-59.733333 104.533334-145.066667 6.4-83.2-76.8-189.866667-115.2-258.133333z" :fill="base.themeName === 'dark' ? '#63e2b7' : '#16AA51'" p-id="31421"></path></svg>
          <h2 class="dark:text-gray-100 text-center mt-4 mb-18 font-serif text-4xl font-bold leading-9 tracking-tight text-gray-900">Shellchat</h2>
        </div>
        <div v-if="!formState">
          <n-form
            :ref="el => loginState.formRef = el"
            inline
            :label-width="80"
            :model="loginState.form"
            :rules="loginState.rules"
            size="large"
            label-placement="top"
          >
            <n-grid :cols="24" :x-gap="xGap">
              <n-form-item-gi :span="24" label="用户名/邮箱" path="account">
                <n-input v-model:value="loginState.form.account" placeholder="请输入" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="密码" path="password">
                <n-input v-model:value="loginState.form.password" @keyup.enter="loginState.events?.onSubmit(triggerModalEvent, 'modalCaptcha')" type="password" placeholder="请输入" show-password-on="click" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24">
                <n-button :loading="loginState.loadingState.submit" class="w-full" boolean attr-type="button" type="primary" @click="loginState.events?.onSubmit(triggerModalEvent, 'modalCaptcha')">登 录</n-button>
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
        <div v-else>
          <n-form
            :ref="el => registerState.formRef = el"
            inline
            :label-width="80"
            :model="registerState.form"
            :rules="registerState.rules"
            size="large"
            label-placement="top"
          >
            <n-grid :cols="24" :x-gap="xGap">
              <n-form-item-gi :span="24" label="用户名" path="account">
                <n-input v-model:value="registerState.form.account" placeholder="请输入" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="密码" path="password">
                <n-input v-model:value="registerState.form.password" type="password" placeholder="请输入" show-password-on="click" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="确认密码" path="confirmPwd">
                <n-input v-model:value="registerState.form.confirmPwd" type="password" placeholder="请输入" show-password-on="click" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="邮箱" path="email">
                <n-input v-model:value="registerState.form.email" placeholder="请输入" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="验证码" path="code">
                <n-input-group>
                  <n-input v-model:value="registerState.form.code" placeholder="请输入" :allow-input="noSideSpace" />
                  <n-button :loading="registerState.loadingState.code" :disabled="num < 60" ghost @click="registerState.events?.onSendCode">{{ codeTxt }}</n-button>
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi :span="24">
                <n-button :loading="registerState.loadingState.submit" class="w-full" boolean attr-type="button" type="primary" @click="registerState.events?.onSubmit">注 册</n-button>
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
        <div class="flex justify-between items-center">
          <div>
            <span class="dark:text-gray-100">{{ formState ? '已有账户？' : '没有账号？' }}</span>
            <n-button text :focusable="false" type="primary" @click="handleSwitch">{{ formState ? '登录' : '创建账户' }}</n-button>
          </div>
          <div v-if="!formState">
            <n-button text :focusable="false" type="primary" @click="triggerModalEvent('modalForgetPwd')">忘记密码</n-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 重置密码 -->
    <n-modal
      v-model:show="modalConfig.modalForgetPwd.show"
      preset="card"
      :style="{ width: modalConfig.modalForgetPwd.width }"
      :title="modalConfig.modalForgetPwd.title"
    >
      <div class="relative w-full overflow-hidden">
        <Transition name="slide-fade" tag="ul">
          <n-form
            v-if="!modalConfig.modalForgetPwd.state"
            :ref="el => modalConfig.modalForgetPwd.formRef = el"
            inline
            :label-width="80"
            :model="modalConfig.modalForgetPwd.form"
            :rules="modalConfig.modalForgetPwd.rules"
            size="large"
            label-placement="top"
          >
            <n-grid :cols="24" :x-gap="12">
              <n-form-item-gi :span="24" label="邮箱" path="email">
                <n-input v-model:value="modalConfig.modalForgetPwd.form.email" placeholder="请输入" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="验证码" path="code">
                <n-input-group>
                  <n-input v-model:value="modalConfig.modalForgetPwd.form.code" placeholder="请输入" :allow-input="noSideSpace" />
                  <n-button :loading="modalConfig.modalForgetPwd.loadingState.code" :disabled="num < 60" ghost @click="modalConfig.modalForgetPwd.events?.onVerifyCode">{{ codeTxt }}</n-button>
                </n-input-group>
              </n-form-item-gi>
            </n-grid>
          </n-form>
          <n-form
            v-else
            :ref="el => modalConfig.modalForgetPwd.formRef = el"
            inline
            :label-width="80"
            :model="modalConfig.modalForgetPwd.form"
            :rules="modalConfig.modalForgetPwd.rules"
            size="large"
            label-placement="top"
          >
            <n-grid :cols="24" :x-gap="12">
              <n-form-item-gi :span="24" label="新密码" path="newPwd">
                <n-input v-model:value="modalConfig.modalForgetPwd.form.newPwd" type="password" placeholder="请输入" show-password-on="click" :allow-input="noSideSpace" />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="确认密码" path="confirmPwd">
                <n-input v-model:value="modalConfig.modalForgetPwd.form.confirmPwd" type="password" placeholder="请输入" show-password-on="click" :allow-input="noSideSpace" />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </Transition>
      </div>
      <template #footer>
        <div class="flex justify-end items-center">
          <n-space>
            <n-button @click="modalConfig.modalForgetPwd.events?.onCancel">{{ modalConfig.modalForgetPwd.cancelText }}</n-button>
            <n-button :loading="modalConfig.modalForgetPwd.loadingState.confirm" type="primary" @click="modalConfig.modalForgetPwd.events?.onConfirm">{{ modalConfig.modalForgetPwd.confirmText }}</n-button>
          </n-space>
        </div>
      </template>
    </n-modal>
    <!-- 安全验证 -->
    <n-modal
      v-model:show="modalConfig.modalCaptcha.show"
      :style="{ width: modalConfig.modalCaptcha.width }"
      :title="modalConfig.modalCaptcha.title"
    >
      <div class="w-full h-full bg-white">
        <n-spin :show="modalConfig.modalCaptcha.loadingState.render">
          <click-captcha
            @getImg="modalConfig.modalCaptcha.loadingState.render = true"
            @completeImg="modalConfig.modalCaptcha.loadingState.render = false"
            @result="val => modalConfig.modalCaptcha.events?.onConfirm(val, (loginState.events?.onLogin as () => void))"
            @close="modalConfig.modalCaptcha.show = false"
          />
        </n-spin>
      </div>
    </n-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NSpin, NModal, NSpace, NButton, NInput, NForm, NFormItemGi, NGrid, NInputGroup } from 'naive-ui';
import { useLoginModal, useLogin } from '@/views/Login/hooks';
import SwitchTheme from '@/components/SwitchTheme.vue';
import { noSideSpace } from '@/utils/tools';
import ClickCaptcha from '@/components/ClickCaptcha.vue';

export default defineComponent({
  name: 'Login',
  components: { NSpin, ClickCaptcha, SwitchTheme, NModal, NSpace, NButton, NInput, NForm, NFormItemGi, NGrid, NInputGroup },
  setup() {
    return {
      noSideSpace,
      ...useLoginModal(),
      ...useLogin()
    };
  }
});
</script>

<style scoped>
.bg-login {
  background-image: url('../../assets/images/login_bg.png');
}
</style>
