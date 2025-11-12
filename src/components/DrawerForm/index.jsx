import PropTypes from 'prop-types';
import { useState } from 'react';
import { Drawer, message, Select, Space, Upload } from 'antd';
import ThemedButton from '../ThemedButton';
import ImgCrop from 'antd-img-crop';
import { max } from 'date-fns';
import { uploadMultipleImages } from '../../apis';

const inputTypes = {
  text: 'text',
  textarea: 'textarea',
  select: 'select',
  date: 'date',
  number: 'number',
};

const DrawerForm = ({
  visible,
  setVisible,
  title,
  action,
  form,
  formItems,
  showImageUpload = false,
  imageRequired = false,
  maxImageCount = 2,
  minImageCount = 1,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageErr, setImageErr] = useState(null);

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setImageErr(null);
    let urls = [];
    try {
      if (showImageUpload && imageRequired) {
        if (!imageFiles.length) {
          setImageErr(`Image is required`);
          setLoading(false);
          return;
        } else if (imageFiles.length < minImageCount) {
          setImageErr(`Please upload at least ${minImageCount} image(s)`);
          setLoading(false);
          return;
        }
      }

      if (imageFiles.length > 0) {
        urls = await uploadMultipleImages('tickets', imageFiles);
      }

      await onSubmit(data, urls);
      setVisible(false);
      reset();
      setImageFiles([]);
      setImageErr(null);
    } catch (error) {
      message.error(error.response?.data?.message || 'Something went wrong.');
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={<p className="text-xl font-normal">{title}</p>}
      open={visible}
      onClose={() => {
        setVisible(false);
        reset();
        setImageFiles([]);
        setImageErr(null);
      }}
      closable={false}
      width={800}
      extra={
        <Space>
          <ThemedButton
            text="Cancel"
            variant="outlined"
            onClick={() => {
              setVisible(false);
              reset();
              setImageFiles([]);
              setImageErr(null);
            }}
            disabled={loading}
          />
          <ThemedButton
            text={action === 'create' ? 'Submit' : 'Update'}
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
          />
        </Space>
      }
    >
      <form aria-disabled={loading} className="flex flex-col gap-4">
        {formItems?.map((item) => (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor={item.name} className="text-lg">
                {item.label}
              </label>
              {item.type === inputTypes.select ? (
                <Select
                  showSearch
                  placeholder={item.placeholder || `Select ${item.label}`}
                  value={watch(item.name)}
                  onChange={(value) => setValue(item.name, value)}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={item.options}
                  className="w-full"
                />
              ) : item.type === inputTypes.textarea ? (
                <textarea
                  {...register(item.name)}
                  placeholder={item.placeholder || `Enter ${item.label}`}
                  rows={item.rows || 3}
                  className="w-full border-2 border-gray-300 p-2 rounded-sm focus:outline-none"
                />
              ) : (
                <input
                  {...register(item.name, {
                    ...(item.type === inputTypes.number && {
                      valueAsNumber: true,
                    }),
                  })}
                  type={inputTypes[item.type] || inputTypes.text}
                  placeholder={item.placeholder || `Enter ${item.label}`}
                  className="w-full border-2 border-gray-300 p-2 rounded-sm focus:outline-none"
                  {...(item.type === inputTypes.number && {
                    min: item.min,
                    max: item.max,
                  })}
                />
              )}
              {errors[item.name] && (
                <p className="text-red-500">{errors[item.name].message}</p>
              )}
            </div>
          </>
        ))}

        {showImageUpload && (
          <>
            <ImgCrop rotationSlider>
              <Upload
                showUploadList={{
                  showRemoveIcon: true,
                  showPreviewIcon: false,
                }}
                multiple={false}
                listType="picture-card"
                fileList={imageFiles}
                maxCount={maxImageCount}
                disabled={loading}
                beforeUpload={() => false}
                onChange={({ fileList: newFileList }) =>
                  setImageFiles(newFileList)
                }
              >
                {imageFiles.length >= maxImageCount ? null : '+ Upload'}
              </Upload>
            </ImgCrop>
            {imageErr && <p className="text-red-500">{imageErr}</p>}
          </>
        )}
      </form>
    </Drawer>
  );
};

DrawerForm.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  action: PropTypes.oneOf(['create', 'edit']).isRequired,
  form: PropTypes.object.isRequired,
  formItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  showImageUpload: PropTypes.bool,
  imageRequired: PropTypes.bool,
  maxImageCount: PropTypes.number,
  minImageCount: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
};

export default DrawerForm;
