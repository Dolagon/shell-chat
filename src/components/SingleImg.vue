<template>
  <div>
    <n-avatar
      class="cursor-pointer"
      size="large"
      round
      :src="src"
      @click="triggerModalEvent('modalView')"
    />
    <!-- 查看图片 -->
    <n-modal
      v-model:show="modalConfig.modalView.show"
      preset="card"
      transform-origin="center"
      :style="{ width: modalConfig.modalView.width, ...modalStyle }"
      :title="modalConfig.modalView.title"
      :mask-closable="false"
    >
      <n-upload
        abstract
        :default-file-list="fileList"
        :max="1"
        :default-upload="false"
        :on-change="val => triggerModalEvent('modalCropper', val)"
        accept="image/*"
        @before-upload="modalConfig.modalView.events?.onBeforeUpload"
      >
        <n-upload-trigger #="{ handleClick }" abstract>
          <div class="w-full h-full flex justify-center items-center">
            <n-image
              :width="base.isMobile ? '100%' : '502px'"
              class="cursor-pointer"
              preview-disabled
              show-toolbar-tooltip
              :src="src"
              :fallback-src="imgFail"
              @click="handleClick"
            >
              <template #placeholder>
                <n-skeleton :height="skeletonSize" :width="skeletonSize" />
              </template>
            </n-image>
          </div>
        </n-upload-trigger>
      </n-upload>
    </n-modal>
    <!-- 裁剪图片 -->
    <n-modal
      v-model:show="modalConfig.modalCropper.show"
      preset="card"
      :style="{ width: modalConfig.modalCropper.width, ...modalStyle }"
      :title="modalConfig.modalCropper.title"
      :mask-closable="false"
    >
      <div class="h-80">
        <div class="w-full h-full flex">
          <div class="w-3/4 h-full flex flex-col">
            <div class="w-full h-5/6 bg-green-200">
              <img id="cropImg">
            </div>
            <div class="flex-1 flex justify-center items-center">
              <n-button-group>
                <n-button type="default" :focusable="false" round @click="modalConfig.modalCropper.events?.onControl('left')">
                  <template #icon>
                    <n-icon><arrow-undo /></n-icon>
                  </template>
                </n-button>
                <n-button type="default" :focusable="false" @click="modalConfig.modalCropper.events?.onControl('right')">
                  <template #icon>
                    <n-icon><arrow-redo /></n-icon>
                  </template>
                </n-button>
                <n-button type="default" :focusable="false" @click="modalConfig.modalCropper.events?.onControl('minus')">
                  <template #icon>
                    <n-icon><remove /></n-icon>
                  </template>
                </n-button>
                <n-button type="default" :focusable="false" @click="modalConfig.modalCropper.events?.onControl('plus')">
                  <template #icon>
                    <n-icon><add /></n-icon>
                  </template>
                </n-button>
                <n-button type="default" :focusable="false" round @click="modalConfig.modalCropper.events?.onControl('reset')">
                  <template #icon>
                    <n-icon><reload-outline /></n-icon>
                  </template>
                </n-button>
              </n-button-group>
            </div>
          </div>
          <div class="flex-1 flex flex-col items-center pl-2 box-border">
            <span class="bold mb-2">裁剪预览</span>
            <div class="previewBoxRound w-20 h-20 rounded-full shadow overflow-hidden"></div>
          </div>
        </div>
      </div>
      <n-divider style="margin: 0;" />
      <template #footer>
        <div class="flex justify-end items-center">
          <n-space>
            <n-button :disabled="modalConfig.modalCropper.loadingState.submit" @click="modalConfig.modalCropper.show = false">取消</n-button>
            <n-button :loading="modalConfig.modalCropper.loadingState.submit" type="primary" @click="modalConfig.modalCropper.events?.onConfirm">确认</n-button>
          </n-space>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import {
  NImage,
  NDivider,
  UploadFileInfo,
  NUpload,
  NUploadTrigger,
  NAvatar,
  NModal,
  NButton,
  NButtonGroup,
  NIcon,
  NSpace,
  NSkeleton
} from 'naive-ui';
import { ArrowUndo, ArrowRedo, Add, Remove, ReloadOutline } from '@vicons/ionicons5';
import { computed, nextTick, reactive, ref } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import useNModal from '@/hooks/useNModal.ts';
import { FormState } from '@/utils/types.ts';
import { base64ToFile } from '@/utils/tools.ts';
import useUserStore from '@/store/user.ts';
import { updateUser } from '@/api/user';
import { IMG_BASE_URL } from '@/utils/config.ts';
import useModalConfig from '@/hooks/useModalConfig.ts';
import useBaseStore from '@/store/base.ts';
import imgFail from '@/assets/images/img_fail.png';
import useImgCompress from '@/hooks/useImgCompress.ts';

interface SingleImgEventsState {
  onConfirm: () => void;
  onControl: (val: 'left' | 'right' | 'minus' | 'plus' | 'reset') => void;
}

interface ViewImgEventsState {
  onBeforeUpload: (data: {
    file: UploadFileInfo;
    fileList: UploadFileInfo[];
  }) => void;
}

interface SingleImgState {
  CROPPER: null | Cropper;
  currentFileName: string;
}

interface SingleImgModalState {
  modalView: FormState<{}, 'img', ViewImgEventsState>;
  modalCropper: FormState<SingleImgState, 'submit', SingleImgEventsState>;
}

interface UploadChangeOptions {
  file: UploadFileInfo;
  fileList: Array<UploadFileInfo>;
  event?: Event;
}

const message = window.$message;
const src = defineModel('src', { type: String, default: '' });
const emit = defineEmits<{
  setImgSize: [val: { width: number; height: number; }]
}>();

const boxData = {
  left: 30,
  top: 16,
  width: 230,
  height: 230
};
const { userInfo, setUserInfo } = useUserStore();
const fileList = ref<UploadFileInfo[]>([]);
const modalConfig = reactive<SingleImgModalState>({
  modalView: {
    show: false,
    loadingState: {
      img: false
    },
    title: userInfo.username,
    width: '550px',
    form: {},
    events: {
      onBeforeUpload: data => {
        const { size } = data.file.file as File;
        if (size > 1.5 * 1024 * 1024) {
          message.error('图片不能大于1.5M')
          return false
        }
        return true;
      },
    }
  },
  modalCropper: {
    show: false,
    loadingState: {
      submit: false
    },
    title: '图片裁剪',
    width: '440px',
    form: {
      CROPPER: null,
      currentFileName: ''
    },
    events: {
      onControl: type => {
        const selfState = modalConfig.modalCropper;
        switch (type) {
          case 'left':
            selfState.form.CROPPER?.rotate(-90);
            break;
          case 'right':
            selfState.form.CROPPER?.rotate(90);
            break;
          case 'minus':
            selfState.form.CROPPER?.zoom(-0.1);
            break;
          case 'plus':
            selfState.form.CROPPER?.zoom(0.1);
            break;
          case 'reset':
            selfState.form.CROPPER?.reset().setCropBoxData(boxData);
            break;
          default:break;
        }
      },
      onConfirm: async () => {
        const selfState = modalConfig.modalCropper;
        selfState.loadingState.submit = true;
        const url = selfState.form.CROPPER?.getCroppedCanvas({
          maxWidth: 4096,
          maxHeight: 4096,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        }).toDataURL();
        let file = base64ToFile(url as string, selfState.form.currentFileName) as File;
        const reader = new FileReader();
        reader.onload = event => {
          const img = new Image();
          img.onload = () => {
            // 获取图片的宽度和高度
            const width = img.width;
            const height = img.height;
            emit('setImgSize', { width, height });
          };
          if (event.target) img.src = event.target.result as string;
        };
        reader.readAsDataURL(file);
        // 压缩大于500kb的图片
        if (file.size > 512000) {
          file = base64ToFile(await useImgCompress(file, 0.1), selfState.form.currentFileName) as File;
        }
        // 上传图片
        const formData = new FormData();
        formData.append('_id', userInfo._id);
        formData.append('photo', file);
        updateUser(formData).then(({ data }) => {
          selfState.show = false;
          setUserInfo('photo', data.photo);
          src.value = `${IMG_BASE_URL}${data.photo}`;
        }).finally(() => {
          selfState.loadingState.submit = false;
        });
      }
    }
  }
});
const skeletonSize = computed(() => base.isMobile ? '300px' : '502px');

const base = useBaseStore();
const {
  triggerModalEvent
} = useNModal<SingleImgModalState, UploadChangeOptions | undefined>(modalConfig, modalConfig => ({
  modalView: () => {
    modalConfig.modalView.show = true;
  },
  modalCropper: options => {
    const selfState = modalConfig.modalCropper;
    const { file } = options as UploadChangeOptions;
    selfState.form.currentFileName = file.name;
    selfState.show = true;
    nextTick(() => {
      let reader = new FileReader();
      reader.readAsDataURL(file.file as File);
      reader.onload = () => {
        const imgElement: HTMLImageElement | null = document.querySelector('img#cropImg');
        if (imgElement) {
          imgElement.src = reader.result as string;
          selfState.form.CROPPER = new Cropper(imgElement, {
            viewMode: 0,
            minContainerWidth: 220,
            minContainerHeight: 220,
            dragMode: 'move',
            ready: () => {
              if (selfState.form.CROPPER) selfState.form.CROPPER.setCropBoxData(boxData);
            },
            preview: [
              document.querySelector('.previewBoxRound')
            ]
          });
        }
      };
    });
  }
}));
const { modalStyle } = useModalConfig();
</script>
