import React from 'react'
import templateHtml from '!!raw-loader!../../custom_page.html'

const template = { __html: templateHtml }

export const AiGenComponent = () => {
  return <div dangerouslySetInnerHTML={template} />
}
