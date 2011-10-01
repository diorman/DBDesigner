COMPRESSOR=compressor/yuicompressor-2.4.2.jar
OUTPUT=../js/dbdesigner.js
MAIN=Main.js

FILES=	classes/EventDispatcher.js \
	classes/Component.js \
	classes/ComponentUI.js \
	classes/ComponentModel.js \
	classes/DBDesigner.js \
	classes/ToolBar.js \
	classes/Canvas.js \
	classes/ObjectDetail.js \
	classes/TableDialog.js \
	classes/DBObject.js \
	classes/Table.js \
	classes/TableCollection.js \


default:    ${FILES}
	@echo "Generating the js main file"
	@cat ${FILES} > ${OUTPUT}
	@echo "js main file generated"

compressed: default
	@echo "Compressing the js main file"
	@java -jar ${COMPRESSOR} ${OUTPUT} -o ${OUTPUT}
	@echo "js main file compressed"

clean:
	@echo "Deleting the js main file"
	@rm -fv ${OUTPUT}