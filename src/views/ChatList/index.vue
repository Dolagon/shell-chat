<template>
  <div class="flex flex-col justify-between items-center w-full h-full">
    <div :class="`w-full h-14 rounded cursor-pointer ${base.themeName === 'dark' ? 'hover:bg-dark-model' : 'hover:bg-gray-100'}`" @click="handleCreate">
      <div :class="[onActive ? 'scaled' : 'done']" class="w-full h-full flex items-center px-3 box-border origin-center transition-transform duration-100 ease-in-out">
        <chat-gpt-svg />
        <span class="font-semibold ml-2 overflow-ellipsis whitespace-nowrap overflow-hidden">New chat</span>
      </div>
    </div>
    <n-scrollbar class="flex-1 relative my-2.5">
      <n-spin v-if="isLoading('list')" size="small" class="absolute inset-0 m-auto" />
      <n-list v-else-if="!isLoading('list') && dataList.length" hoverable clickable style="width: 220px;">
        <n-list-item
          v-for="(item, index) in dataList"
          :key="index"
          :class="`${activeId === item._id ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-50 dark:bg-black'} n-list-item`"
          @click="handleItem(item)"
        >
          <div class="w-full flex justify-between items-center relative">
            <n-input
              ref="titleInputRef"
              v-if="editForm._id === item._id"
              v-model:value="editForm.title"
              type="text"
              size="tiny"
              placeholder="请输入"
              @keyup.enter="handleSaveTitle(item)"
              @blur="handleSaveTitle(item)"
            />
            <n-tooltip v-else trigger="hover" :disabled="item.titleLength < 150">
              <template #trigger>
                <div style="width: 160px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                  <span @mouseenter="e => handleTitleFocus(e, item)">{{ item.title }}</span>
                </div>
              </template>
              {{ item.title }}
            </n-tooltip>
            <div v-if="!item.loading" :class="`w-8 justify-between ${activeId === item._id ? '' : 'hidden'} options`">
              <n-icon @click.stop="handleEdit(item)"><pencil-sharp /></n-icon>
              <n-icon @click.stop="handleRemove(item)"><trash /></n-icon>
            </div>
            <n-spin v-if="item.loading" size="small" class="absolute -right-2" />
          </div>
        </n-list-item>
      </n-list>
      <n-empty v-else description="暂无数据" style="position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);"></n-empty>
    </n-scrollbar>
    <n-popselect
      v-model:value="bottomVal"
      trigger="click"
      size="large"
      style="width: 220px;"
      :options="options"
      @updateShow="bottomVal = null"
      @updateValue="val => handleChange(val, { fn: triggerModalEvent, code: 'modalSetting' })"
    >
      <div :class="`w-full h-14 px-3 box-border rounded cursor-pointer ${base.themeName === 'dark' ? 'hover:bg-dark-model' : 'hover:bg-gray-100'}`">
        <div class="w-full h-full flex items-center">
          <n-avatar round size="small" :src="avatar" />
          <span class="font-medium ml-2 overflow-ellipsis whitespace-nowrap overflow-hidden">{{ user.userInfo.username }}</span>
        </div>
      </div>
    </n-popselect>
    <!-- 设置 -->
    <n-modal
      v-model:show="modalConfig.modalSetting.show"
      preset="card"
      :style="{ width: modalConfig.modalSetting.width, ...modalStyle }"
      :title="modalConfig.modalSetting.title"
    >
      <div class="h-96">
        <n-tabs animated placement="left">
          <n-tab-pane name="general" tab="通用设置">
            <div class="p-2.5 box-border">
              <n-form
                :label-width="100"
                :model="modalConfig.modalSetting.form.general"
                size="small"
                label-align="left"
                label-placement="left"
              >
                <n-form-item path="context">
                  <template #label>
                    <div class="flex justify-start items-center">
                      <span>上下文关联</span>
                      <n-tooltip trigger="hover" placement="top">
                        <template #trigger>
                          <n-icon size="18" class="pb-5 pl-1 cursor-pointer box-border">
                            <help-circle />
                          </n-icon>
                        </template>
                        为了节省OpenAI API请求费用 最大关联6组对话
                      </n-tooltip>
                    </div>
                  </template>
                  <div class="w-full flex justify-end">
                    <n-switch
                      v-model:value="modalConfig.modalSetting.form.general.context"
                      :loading="modalConfig.modalSetting.loadingState.context"
                      @update:value="modalConfig.modalSetting.events?.onContext"
                    />
                  </div>
                </n-form-item>
                <n-form-item label="流式传输" path="textStream">
                  <div class="w-full flex justify-end">
                    <n-switch
                      v-model:value="modalConfig.modalSetting.form.general.textStream"
                      :loading="modalConfig.modalSetting.loadingState.stream"
                      @update:value="modalConfig.modalSetting.events?.onStream"
                    />
                  </div>
                </n-form-item>
                <n-form-item label="模型" path="model">
                  <n-select
                    v-model:value="modalConfig.modalSetting.form.general.model"
                    :options="modalConfig.modalSetting.options"
                    :loading="modalConfig.modalSetting.loadingState.model"
                    @updateValue="val => modalConfig.modalSetting.events?.onModel(val, handleReload)"
                  />
                </n-form-item>
                <n-form-item path="requestLimit">
                  <template #label>
                    <div class="flex justify-start items-center">
                      <span>可用次数</span>
                      <n-tooltip trigger="hover" placement="top">
                        <template #trigger>
                          <n-icon size="18" class="pb-5 pl-1 cursor-pointer box-border">
                            <help-circle />
                          </n-icon>
                        </template>
                        <template #header>
                          GPT-3.5每次请求消耗1、GPT-4每次请求消耗2
                        </template>
                        每天0点重置次数为10
                      </n-tooltip>
                    </div>
                  </template>
                  <span>{{ modalConfig.modalSetting.form.general.requestLimit }}</span>
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>
          <n-tab-pane name="account" tab="账号设置">
            <div class="p-2.5 box-border">
              <n-form
                :label-width="70"
                :model="modalConfig.modalSetting.form.account"
                size="small"
                label-align="left"
                label-placement="left"
              >
                <n-form-item label="头像" path="photo" size="medium">
                  <div class="w-full flex justify-end">
                    <single-img v-model:src="modalConfig.modalSetting.form.account.photo" />
                  </div>
                </n-form-item>
                <n-form-item label="用户名" path="username">
                  <n-input-group>
                    <n-input
                      v-model:value="modalConfig.modalSetting.form.account.username"
                      type="text"
                      placeholder="请输入"
                      :allow-input="noSideSpace"
                    />
                    <n-button
                      :focusable="false"
                      :loading="modalConfig.modalSetting.loadingState.username"
                      :disabled="modalConfig.modalSetting.form.account.username === user.userInfo.username"
                      @click="modalConfig.modalSetting.events?.onUpdateUsername"
                      type="primary"
                      ghost
                    >保存</n-button>
                  </n-input-group>
                </n-form-item>
                <n-form-item label="邮箱" path="email">
                  <n-input
                    v-model:value="modalConfig.modalSetting.form.account.email"
                    type="text"
                    placeholder="请输入"
                    disabled
                  />
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>
          <n-tab-pane name="updatePwd" tab="修改密码">
            <div class="p-2.5 box-border">
              <n-form
                :ref="el => modalConfig.modalSetting.formRef = el"
                :label-width="80"
                :model="modalConfig.modalSetting.form.updatePwd"
                :rules="modalConfig.modalSetting.rules"
                size="small"
                label-align="left"
                label-placement="left"
              >
                <n-form-item label="新密码" path="newPwd">
                  <n-input
                    v-model:value="modalConfig.modalSetting.form.updatePwd.newPwd"
                    type="password"
                    placeholder="请输入"
                    show-password-on="click"
                    :allow-input="noSideSpace"
                  />
                </n-form-item>
                <n-form-item label="确认密码" path="confirmPwd">
                  <n-input
                    v-model:value="modalConfig.modalSetting.form.updatePwd.confirmPwd"
                    type="password"
                    placeholder="请输入"
                    show-password-on="click"
                    :allow-input="noSideSpace"
                  />
                </n-form-item>
                <n-form-item>
                  <div class="w-full flex justify-end">
                    <n-button
                      type="primary"
                      :loading="modalConfig.modalSetting.loadingState.send"
                      :disabled="num < 60"
                      @click="modalConfig.modalSetting.events?.onSave(triggerModalEvent, 'modalCode')"
                    >{{ codeTxt }}</n-button>
                  </div>
                </n-form-item>
              </n-form>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
      <template #footer>
        <div class="flex justify-end items-center">
          <n-button @click="modalConfig.modalSetting.show = false">关闭</n-button>
        </div>
      </template>
    </n-modal>
    <!-- 验证码 -->
    <n-modal
      v-model:show="modalConfig.modalCode.show"
      preset="card"
      :style="{ width: modalConfig.modalCode.width, ...modalStyle }"
      :title="modalConfig.modalCode.title"
    >
      <n-form
        :ref="el => modalConfig.modalCode.formRef = el"
        :model="modalConfig.modalCode.form"
        :rules="modalConfig.modalCode.rules"
        :show-label="false"
        size="large"
      >
        <n-input-group>
          <n-input
            v-model:value="modalConfig.modalCode.form.code"
            placeholder="请输入验证码"
            :allow-input="onlyAllowNumber"
          />
          <n-button
            :focusable="false"
            :loading="modalConfig.modalCode.loadingState.submit"
            @click="modalConfig.modalCode.events?.onSubmit"
            type="primary"
            ghost
          >确认</n-button>
        </n-input-group>
      </n-form>
    </n-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  NSelect,
  NSwitch,
  NTabs,
  NTabPane,
  NPopselect,
  NAvatar,
  NList,
  NListItem,
  NScrollbar,
  NIcon,
  NInput,
  NInputGroup,
  NTooltip,
  NSkeleton,
  NSpin,
  NEmpty,
  NModal,
  NButton,
  NForm,
  NFormItem,
} from 'naive-ui';
import { useChatList, useChatListModel } from '@/views/ChatList/hooks';
import { PencilSharp, Trash, HelpCircle } from '@vicons/ionicons5';
import ChatGptSvg from '@/components/ChatGptSvg.vue';
import SingleImg from '@/components/SingleImg.vue';
import { noSideSpace, onlyAllowNumber } from '@/utils/tools.ts';
import useModalConfig from '@/hooks/useModalConfig.ts';

export default defineComponent({
  name: 'ChatList',
  components: {
    HelpCircle,
    NInputGroup,
    SingleImg,
    NSelect,
    NSwitch,
    NFormItem,
    NForm,
    NTabs,
    NTabPane,
    NButton,
    NModal,
    ChatGptSvg,
    NPopselect,
    NAvatar,
    NList,
    NListItem,
    NScrollbar,
    NIcon,
    PencilSharp,
    Trash,
    NInput,
    NTooltip,
    NSkeleton,
    NSpin,
    NEmpty
  },
  setup() {
    return {
      onlyAllowNumber,
      noSideSpace,
      ...useModalConfig(),
      ...useChatListModel(),
      ...useChatList()
    };
  }
});
</script>

<style scoped>
.n-list-item:hover .options {
  display: flex;
}
.scaled {
  transform: scale(0.9);
}
.done {
  transform: scale(1);
}
</style>
